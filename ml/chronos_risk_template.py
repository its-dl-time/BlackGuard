"""
chronos_risk_template
---------------------

This module illustrates how to use a pretrained time‑series foundation model
Chronos‑2 to compute a behavioural‑risk score for an investment strategy.

The workflow follows the definition **B** described in the project notes: the
risk metric is based on the **expected maximum drawdown (E[MDD])** over the
planned holding period.  The higher the expected drawdown, the higher the
behavioural risk score.  A zero‑shot model such as Chronos‑2 produces a
distribution of future values without any additional training.  We convert
those probabilistic forecasts into an E[MDD] estimate and map it to a
0–100 score.

Note
----
This file contains illustrative code.  It uses the chronos‑forecasting
library available from Hugging Face for local inference.  The library
depends on PyTorch and may require a modern Python environment and a
recent version of pandas (with pyarrow support).  The code is not
executed here but serves as a starting point for integrating Chronos‑2
into the Blackguard behavioural‑coaching MVP.

References
----------
Chronos‑2 is a 120M‑parameter encoder‑only time‑series foundation model
that supports univariate, multivariate and covariate‑informed tasks.  It
produces multi‑step quantile forecasts using a group‑attention mechanism.
Because the model is pretrained on large real and synthetic datasets it
can be used in **zero‑shot** mode for new time series without dataset‑specific
training【488993241644590†L61-L70】.  The model can be loaded using the
`chronos‑forecasting` package as shown in the example below【488993241644590†L103-L133】.

"""

from __future__ import annotations
import math
import numpy as np
import pandas as pd
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple


@dataclass
class StrategyConfig:
    """Data class representing the investor's strategy parameters.

    Attributes
    ----------
    entry_price : float
        The price at which the position is entered.
    take_profit_pct : float
        The take‑profit threshold expressed as a percentage (e.g. 0.12 for
        +12 %).
    stop_loss_pct : float
        The stop‑loss threshold expressed as a percentage (e.g. 0.06 for
        –6 %).
    holding_period_days : int
        Planned holding period in trading days.  This determines the
        forecasting horizon.
    position_size_pct : float
        Fraction of the portfolio allocated to the position.  Used to
        aggregate scores across assets.
    symbol : Optional[str]
        Ticker symbol for reference (optional).
    side : str
        "long" or "short".  This template assumes long positions; short
        logic would invert drawdown calculations.
    """

    entry_price: float
    take_profit_pct: float
    stop_loss_pct: float
    holding_period_days: int
    position_size_pct: float = 1.0
    symbol: Optional[str] = None
    side: str = "long"

    @classmethod
    def from_json(cls, data: Dict[str, float]) -> "StrategyConfig":
        """Create a `StrategyConfig` from a JSON‑like dictionary.

        Parameters
        ----------
        data : dict
            A dictionary with keys matching the field names of this data class.

        Returns
        -------
        StrategyConfig
            Parsed strategy configuration.
        """
        return cls(
            entry_price=float(data["entry_price"]),
            take_profit_pct=float(data["take_profit_pct"]),
            stop_loss_pct=float(data["stop_loss_pct"]),
            holding_period_days=int(data["holding_period_days"]),
            position_size_pct=float(data.get("position_size_pct", 1.0)),
            symbol=data.get("symbol"),
            side=data.get("side", "long"),
        )


def prepare_time_series(
    ohlc: pd.DataFrame,
    price_col: str = "close",
    id_col: str = "id",
    timestamp_col: str = "timestamp",
    ) -> pd.DataFrame:
    """Convert raw OHLC data into the format expected by Chronos.

    Chronos pipelines expect a pandas DataFrame with columns:

    * `id_column` identifying the series (e.g. a stock symbol).  If the
      input contains only one series, a constant id can be used.
    * `timestamp_column` containing datetime objects (monotonic index).
    * `target` containing the univariate values to forecast.  For
      financial time series it is common to use the log‑price or the
      price itself.  Here we use the natural log of the close price to
      stabilise variance.

    Parameters
    ----------
    ohlc : pandas.DataFrame
        Input data frame with at least a date/time index and columns for
        open, high, low and close prices.  The index must be datetime‑like.
        The price column must contain positive numeric values.
    price_col : str, default "close"
        Column name for the closing price.
    id_col : str, default "id"
        Name of the identifier column in the returned DataFrame.
    timestamp_col : str, default "timestamp"
        Name of the timestamp column in the returned DataFrame.

    Returns
    -------
    pandas.DataFrame
        Data frame with columns [id_col, timestamp_col, "target"] and
        index reset.

    Raises
    ------
    ValueError
        If the index is not datetime, if price_col is missing, or if
        prices contain non‑positive values.
    """
    # Validate index
    if not np.issubdtype(ohlc.index.dtype, np.datetime64):
        raise ValueError(
            f"Index of OHLC data must be datetime (got {ohlc.index.dtype}). "
            "Ensure the DataFrame is indexed by datetime."
        )

    # Validate price column exists
    if price_col not in ohlc.columns:
        raise ValueError(
            f"Column '{price_col}' not found in OHLC data. "
            f"Available columns: {list(ohlc.columns)}"
        )

    # Validate prices are positive (required for log transformation)
    prices = ohlc[price_col].astype(float)
    if (prices <= 0).any():
        raise ValueError(
            f"Price column '{price_col}' contains non‑positive values. "
            "All prices must be positive for log‑price transformation."
        )

    # Compute log‑prices to stabilise the scale and reduce heteroscedasticity
    log_prices = np.log(prices)

    # Infer series ID from 'symbol' column if available, else use default
    if "symbol" in ohlc.columns:
        series_ids = ohlc["symbol"].values
    else:
        series_ids = ["series"] * len(ohlc)

    df = pd.DataFrame({
        id_col: series_ids,
        timestamp_col: ohlc.index,
        "target": log_prices.values,
    })
    return df


def max_drawdown(series: np.ndarray) -> float:
    """Compute the maximum drawdown of a price path.

    The drawdown is defined as the maximum decline from a historical peak.
    The function assumes the input `series` contains **log‑prices**;
    drawdowns are computed on the exponential scale.

    Parameters
    ----------
    series : np.ndarray
        Array of log‑prices along a forecast horizon.

    Returns
    -------
    float
        Maximum drawdown over the horizon expressed as a fraction of the
        price (e.g. 0.2 corresponds to 20 % decline).
    """
    prices = np.exp(series)
    running_max = np.maximum.accumulate(prices)
    drawdowns = 1.0 - prices / running_max
    return float(np.max(drawdowns))


def expected_max_drawdown(
    forecast: pd.DataFrame,
    quantile_level: float = 0.5,
    ) -> float:
    """Calculate the expected maximum drawdown from a probabilistic forecast.

    Chronos pipelines can return forecasts in either **long format** (each
    row contains a quantile value along with an explicit ``quantile``
    column) or **wide format** (each quantile level becomes its own
    column).  This helper inspects the forecast structure and extracts
    the series corresponding to the requested ``quantile_level``.  It then
    computes the maximum drawdown for each series and returns the average.

    Parameters
    ----------
    forecast : pandas.DataFrame
        Data frame returned by ``Chronos2Pipeline.predict_df``.  It may
        contain columns ``id``, ``timestamp``, ``target`` and ``quantile``
        (long format) or separate quantile columns (wide format).  Any
        additional columns are ignored.
    quantile_level : float, default 0.5
        The quantile level to use as the representative trajectory.  For
        instance, 0.5 corresponds to the median forecast.

    Returns
    -------
    float
        Estimated maximum drawdown over the forecast horizon.  If no
        suitable quantile column is found, the function falls back to
        using the ``target`` column when present, or returns 0.0 if no
        numeric predictions are available.
    """
    # If the forecast includes an explicit 'quantile' column, use it
    if "quantile" in forecast.columns:
        # Filter to the chosen quantile for each series and horizon
        df_q = forecast[forecast["quantile"] == quantile_level]
        mdd_values: List[float] = []
        # Group by id (if present) to compute drawdown per series
        for _, group in df_q.groupby("id"):
            # Ensure time ordering
            y_hat = group.sort_values("timestamp")["target"].to_numpy()
            mdd_values.append(max_drawdown(y_hat))
        return float(np.mean(mdd_values)) if mdd_values else 0.0

    # Otherwise, treat the DataFrame as wide format
    # Identify candidate quantile columns based on numeric values in the
    # column names.  For example, columns named "0.1", "quantile_0.5" or
    # "p0.75" will all be detected.  Exclude obvious metadata columns.
    import re
    candidate_cols: List[Tuple[float, str]] = []
    for col in forecast.columns:
        # Skip standard metadata columns
        if col in {"id", "timestamp", "target"}:
            continue
        # Try to interpret the entire column name as a float
        val = None  # type: Optional[float]
        try:
            val = float(col)
        except Exception:
            # Look for a numeric substring within the column name
            match = re.search(r"(\d+\.?\d*)", col)
            if match:
                try:
                    val = float(match.group(1))
                except Exception:
                    val = None
        if val is not None:
            candidate_cols.append((val, col))

    # If we found candidate quantile columns, choose the one closest to the
    # requested quantile level; otherwise fall back to 'target' if available
    if candidate_cols:
        # Sort by absolute difference from the desired quantile level
        candidate_cols.sort(key=lambda x: abs(x[0] - quantile_level))
        selected_col = candidate_cols[0][1]
    elif "target" in forecast.columns:
        selected_col = "target"
    else:
        # No numeric columns found; cannot compute drawdown
        return 0.0

    mdd_values: List[float] = []
    # Group by id if present; otherwise treat the entire DataFrame as one series
    if "id" in forecast.columns:
        groups = forecast.groupby("id")
    else:
        groups = [(None, forecast)]  # type: ignore
    for _, group in groups:
        # Ensure time ordering if timestamp is present
        if "timestamp" in group.columns:
            group_sorted = group.sort_values("timestamp")
        else:
            group_sorted = group
        # Extract the selected column as numpy array
        y_hat = group_sorted[selected_col].astype(float).to_numpy()
        # Compute drawdown on the log scale if values are positive;
        # otherwise directly on the provided scale
        try:
            mdd = max_drawdown(y_hat)
        except Exception:
            # If computing on raw scale fails (e.g. negative values), take log
            with np.errstate(invalid="ignore"):
                log_y_hat = np.log(y_hat)
                mdd = max_drawdown(log_y_hat)
        mdd_values.append(mdd)

    return float(np.mean(mdd_values)) if mdd_values else 0.0

def risk_score_from_drawdown(mdd: float) -> int:
    # Hàm căn bậc hai: mdd 4,29% → ~20; mdd 0,4% → ~6
    score = 100 * math.sqrt(mdd)
    return int(min(100, score))


def compute_risk_score(
    ohlc: pd.DataFrame,
    strategy: StrategyConfig,
    quantile_levels: Optional[List[float]] = None,
    device: str = "cpu",
    ) -> Tuple[int, float]:
    """Compute the behavioural risk score for a single asset using Chronos‑2.

    This function orchestrates the preprocessing, forecasting and risk
    calculation pipeline:

      1. Prepare the OHLC data into the required long‑format DataFrame with
         log‑prices.
      2. Load the pretrained Chronos‑2 pipeline from Hugging Face via the
         chronos‑forecasting library.
      3. Generate probabilistic forecasts over the holding period defined in
         the strategy.
      4. Compute the expected maximum drawdown from the forecast.
      5. Convert the drawdown into a risk score.

    Parameters
    ----------
    ohlc : pandas.DataFrame
        Input OHLC data indexed by datetime.  Must include a `close` column.
    strategy : StrategyConfig
        Investor strategy parameters including holding period.
    quantile_levels : list of float, optional
        Quantile levels to request from the model.  Defaults to common
        deciles if not provided.
    device : str, default "cpu"
        Device for inference ("cpu" or "cuda").  Requires an appropriate
        environment and hardware.

    Returns
    -------
    risk_score : int
        Behavioural risk score on a 0–100 scale.
    mdd : float
        Expected maximum drawdown used to compute the score.
    """
    import warnings
    warnings.filterwarnings("ignore", category=UserWarning)

    # 1. Prepare time series data for Chronos
    ts_df = prepare_time_series(ohlc)

    # 2. Load Chronos‑2 pipeline (requires chronos‑forecasting package)
    try:
        from chronos import Chronos2Pipeline  # type: ignore
    except ImportError as exc:
        raise ImportError(
            "chronos‑forecasting is not installed. Install with pip install 'chronos‑forecasting>=2.0'"
        ) from exc

    pipeline = Chronos2Pipeline.from_pretrained(
        "amazon/chronos-2", device_map=device
    )

    # 3. Define quantiles and prediction length (horizon)
    if quantile_levels is None:
        quantile_levels = [0.1, 0.25, 0.5, 0.75, 0.9]
    prediction_length = int(strategy.holding_period_days)

    # 4. Generate probabilistic forecasts
    forecast_df = pipeline.predict_df(
        ts_df,
        prediction_length=prediction_length,
        quantile_levels=quantile_levels,
        id_column="id",
        timestamp_column="timestamp",
        target="target",
    )

    # 5. Compute expected maximum drawdown using median path
    mdd_estimate = expected_max_drawdown(forecast_df, quantile_level=0.5)
    score = risk_score_from_drawdown(mdd_estimate)
    return score, mdd_estimate


def compute_portfolio_risk_score(
    ohlc_dict: Dict[str, pd.DataFrame],
    strategy_dict: Dict[str, StrategyConfig],
    device: str = "cpu",
    ) -> Tuple[float, Dict[str, Tuple[int, float]]]:
    """Compute aggregate risk score for a multi‑asset portfolio.

    This function loops over multiple assets (or positions) and computes
    individual risk scores, then aggregates them using position size weights
    to produce a portfolio‑level risk estimate.

    The portfolio risk score is a weighted average:

        R_portfolio = Σ (position_size_pct × risk_score) / Σ position_size_pct

    This approach is useful for:
    * Assessing total portfolio risk exposure
    * Rebalancing based on aggregate behaviour risk
    * Stress testing with multiple concurrent positions

    Parameters
    ----------
    ohlc_dict : dict[str, pd.DataFrame]
        Dictionary mapping asset symbols to OHLC DataFrames.  Each DataFrame
        must be indexed by datetime and contain a 'close' column.
    strategy_dict : dict[str, StrategyConfig]
        Dictionary mapping asset symbols to StrategyConfig objects.
        Keys should match those in ohlc_dict.
    device : str, default "cpu"
        Device for Chronos inference ("cpu" or "cuda").

    Returns
    -------
    portfolio_risk_score : float
        Aggregate risk score for the portfolio (0–100 scale).
    scores_by_asset : dict[str, tuple[int, float]]
        Dictionary mapping asset symbols to (risk_score, mdd) tuples for
        individual positions. Useful for identifying which assets drive
        portfolio risk.

    Raises
    ------
    KeyError
        If ohlc_dict and strategy_dict do not have overlapping keys.
    ValueError
        If any OHLC data is invalid.
    ImportError
        If chronos‑forecasting is not installed.

    Examples
    --------
    >>> ohlc_dict = {
    ...     "AAPL": pd.DataFrame(..., index=dates),
    ...     "TSLA": pd.DataFrame(..., index=dates),
    ... }
    >>> strategy_dict = {
    ...     "AAPL": StrategyConfig(..., position_size_pct=0.4),
    ...     "TSLA": StrategyConfig(..., position_size_pct=0.6),
    ... }
    >>> port_score, scores = compute_portfolio_risk_score(ohlc_dict, strategy_dict)
    >>> print(f"Portfolio Risk: {port_score:.1f}")
    >>> for symbol, (score, mdd) in scores.items():
    ...     print(f"{symbol}: {score} ({mdd:.2%} MDD)")
    """
    # Validate that keys match
    keys_ohlc = set(ohlc_dict.keys())
    keys_strategy = set(strategy_dict.keys())
    if keys_ohlc != keys_strategy:
        raise KeyError(
            f"Asset symbols must match between ohlc_dict and strategy_dict. "
            f"OHLC has {keys_ohlc}, strategies have {keys_strategy}. "
            f"Difference: {keys_ohlc ^ keys_strategy}"
        )

    # Compute individual risk scores
    scores_by_asset: Dict[str, Tuple[int, float]] = {}
    weighted_scores: List[float] = []
    weights: List[float] = []

    for symbol in ohlc_dict.keys():
        ohlc = ohlc_dict[symbol]
        strategy = strategy_dict[symbol]

        score, mdd = compute_risk_score(ohlc, strategy, device=device)
        scores_by_asset[symbol] = (score, mdd)

        # Weight by position size
        weighted_scores.append(score * strategy.position_size_pct)
        weights.append(strategy.position_size_pct)

    # Compute weighted average
    total_weight = sum(weights)
    if total_weight <= 0:
        portfolio_risk_score = 0.0
    else:
        portfolio_risk_score = sum(weighted_scores) / total_weight

    return float(portfolio_risk_score), scores_by_asset


if __name__ == "__main__":
    # Example usage: run `python chronos_risk_template.py --demo` for single asset
    # or `python chronos_risk_template.py --demo-portfolio` for multiple assets
    import argparse
    import sys

    parser = argparse.ArgumentParser(
        description="Chronos‑2 Behavioural Risk Scoring Module",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Run a single‑asset demo
  python chronos_risk_template.py --demo

  # Run a multi‑asset portfolio demo
  python chronos_risk_template.py --demo-portfolio

  # Run both demos
  python chronos_risk_template.py --demo --demo-portfolio
        """
    )
    parser.add_argument(
        "--demo",
        action="store_true",
        help="Run a single‑asset demo with synthetic data."
    )
    parser.add_argument(
        "--demo-portfolio",
        action="store_true",
        help="Run a multi‑asset portfolio demo."
    )
    args = parser.parse_args()

    if not (args.demo or args.demo_portfolio):
        parser.print_help()
        sys.exit(0)

    # Single‑asset demo
    if args.demo:
        print("=" * 70)
        print("SINGLE‑ASSET RISK SCORING DEMO")
        print("=" * 70)
        print("\nGenerating synthetic OHLC data (random walk)...")

        # Generate synthetic OHLC data (close prices follow a random walk)
        np.random.seed(42)
        dates = pd.date_range(start="2024-06-01", periods=200, freq="B")
        returns = np.random.normal(0.0005, 0.015, size=len(dates))
        close = 100 * np.exp(np.cumsum(returns))
        high = close * (1 + np.abs(np.random.normal(0, 0.005, len(dates))))
        low = close * (1 - np.abs(np.random.normal(0, 0.005, len(dates))))
        open_ = np.roll(close, 1)
        open_[0] = close[0]

        ohlc_demo = pd.DataFrame({
            "open": open_,
            "high": high,
            "low": low,
            "close": close,
        }, index=dates)

        print(f"Date range: {ohlc_demo.index.min()} to {ohlc_demo.index.max()}")
        print(f"Price range: ${ohlc_demo['close'].min():.2f} – ${ohlc_demo['close'].max():.2f}")
        print(f"Observations: {len(ohlc_demo)}")

        strat = StrategyConfig(
            entry_price=float(close[-1]),
            take_profit_pct=0.12,
            stop_loss_pct=0.06,
            holding_period_days=20,
            position_size_pct=0.5,
            symbol="DEMO",
            side="long"
        )

        print(f"\nStrategy Config:")
        print(f"  Entry Price: ${strat.entry_price:.2f}")
        print(f"  Take Profit: {strat.take_profit_pct:.1%}")
        print(f"  Stop Loss: {strat.stop_loss_pct:.1%}")
        print(f"  Holding Period: {strat.holding_period_days} days")
        print(f"  Position Size: {strat.position_size_pct:.1%}")

        print("\nComputing risk score with Chronos‑2...")
        try:
            score, mdd = compute_risk_score(ohlc_demo, strat)
            print(f"\n✓ SUCCESS")
            print(f"  Expected Max Drawdown: {mdd:.2%}")
            print(f"  Risk Score: {score}/100")
            if score < 10:
                risk_level = "Very Low"
            elif score < 25:
                risk_level = "Low"
            elif score < 50:
                risk_level = "Moderate"
            elif score < 75:
                risk_level = "High"
            else:
                risk_level = "Extreme"
            print(f"  Risk Level: {risk_level}")
        except ImportError as e:
            print(f"\n✗ ImportError: {e}")
            print("\nNote: To run this demo, install the chronos‑forecasting library:")
            print("  pip install 'chronos-forecasting>=2.0'")
        except Exception as e:
            print(f"\n✗ Error: {e}")
            import traceback
            traceback.print_exc()

    # Multi‑asset portfolio demo
    if args.demo_portfolio:
        print("\n" + "=" * 70)
        print("MULTI‑ASSET PORTFOLIO DEMO")
        print("=" * 70)
        print("\nGenerating synthetic data for 2 assets...")

        np.random.seed(42)
        dates = pd.date_range(start="2024-06-01", periods=200, freq="B")

        # Asset 1: Lower volatility
        returns_1 = np.random.normal(0.0008, 0.010, size=len(dates))
        close_1 = 100 * np.exp(np.cumsum(returns_1))

        # Asset 2: Higher volatility
        returns_2 = np.random.normal(0.0005, 0.020, size=len(dates))
        close_2 = 100 * np.exp(np.cumsum(returns_2))

        ohlc_dict = {
            "ASSET_1": pd.DataFrame({
                "close": close_1,
                "high": close_1 * 1.01,
                "low": close_1 * 0.99,
                "open": np.roll(close_1, 1),
            }, index=dates),
            "ASSET_2": pd.DataFrame({
                "close": close_2,
                "high": close_2 * 1.01,
                "low": close_2 * 0.99,
                "open": np.roll(close_2, 1),
            }, index=dates),
        }

        strategy_dict = {
            "ASSET_1": StrategyConfig(
                entry_price=float(close_1[-1]),
                take_profit_pct=0.10,
                stop_loss_pct=0.05,
                holding_period_days=20,
                position_size_pct=0.4,
                symbol="ASSET_1",
            ),
            "ASSET_2": StrategyConfig(
                entry_price=float(close_2[-1]),
                take_profit_pct=0.10,
                stop_loss_pct=0.05,
                holding_period_days=20,
                position_size_pct=0.6,
                symbol="ASSET_2",
            ),
        }

        print("Portfolio Allocation:")
        for symbol, strat in strategy_dict.items():
            print(f"  {symbol}: {strat.position_size_pct:.1%}")

        print("\nComputing portfolio risk score...")
        try:
            port_score, scores_by_asset = compute_portfolio_risk_score(
                ohlc_dict, strategy_dict
            )
            print(f"\n✓ SUCCESS")
            print(f"\nPortfolio Risk Score: {port_score:.1f}/100")
            print(f"\nIndividual Asset Scores:")
            for symbol, (score, mdd) in scores_by_asset.items():
                weight = strategy_dict[symbol].position_size_pct
                print(f"  {symbol}: {score}/100 (E[MDD]={mdd:.2%}, weight={weight:.1%})")
        except ImportError as e:
            print(f"\n✗ ImportError: {e}")
            print("\nNote: To run this demo, install the chronos‑forecasting library:")
            print("  pip install 'chronos-forecasting>=2.0'")
        except Exception as e:
            print(f"\n✗ Error: {e}")
            import traceback
            traceback.print_exc()

    print("\n" + "=" * 70)