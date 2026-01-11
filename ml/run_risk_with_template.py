"""
run_risk_with_template.py

This script loads the synthetic VN30 OHLC data and user-defined investment
strategies, then uses the functions defined in chronos_risk_template.py to
compute behavioural risk scores for each strategy.  It prints the risk
score and expected maximum drawdown for each asset, and computes a
weighted average risk score for the portfolio based on the position
sizes defined in the strategies.

Requirements:
- pandas (for data manipulation)
- chronos-forecasting (pretrained time-series model; installed as `chronos`) 
- chronos_risk_template.py must be in the Python path.

Usage:
    python run_risk_with_template.py

"""

import json
import sys

import pandas as pd

# Import the StrategyConfig data class and risk functions from the template
try:
    from chronos_risk_template import StrategyConfig, compute_risk_score
except ImportError as exc:
    sys.stderr.write(
        "Error: chronos_risk_template module not found. Ensure that file "
        "chronos_risk_template.py is available and in the Python path.\n"
    )
    raise


def load_ohlc(csv_path: str) -> pd.DataFrame:
    """Load OHLC data from a CSV file and set the date as the index.

    Parameters
    ----------
    csv_path : str
        Path to the CSV containing OHLC data with columns `date`, `symbol`,
        `open`, `high`, `low`, `close`.

    Returns
    -------
    DataFrame
        DataFrame indexed by datetime with the original columns.
    """
    df = pd.read_csv(csv_path)
    df["date"] = pd.to_datetime(df["date"])
    df = df.set_index("date")
    # Validate that prices are positive
    if (df["close"] <= 0).any():
        raise ValueError("Close prices must be positive.")
    return df

def categorize_risk_score(score: int) -> str:
    """Categorize a risk score into qualitative risk levels.

    Parameters
    ----------
    score : int
        Risk score on a 0–100 scale.

    Returns
    -------
    str
        One of "Very Low", "Low", "Moderate", "High" or "Extreme".
    """
    if score < 20:
        return "Very Low"
    elif score < 40:
        return "Low"
    elif score < 60:
        return "Moderate"
    elif score < 80:
        return "High"
    else:
        return "Extreme"


def load_strategies(json_path: str) -> list[StrategyConfig]:
    """Load strategies from a JSON file into StrategyConfig objects.

    Parameters
    ----------
    json_path : str
        Path to the JSON file containing an array of strategy objects.

    Returns
    -------
    list of StrategyConfig
        List of strategy configurations parsed from the JSON.
    """
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    strategies = [StrategyConfig.from_json(item) for item in data]
    return strategies


def main() -> None:
    # Paths to the data files; adjust if your files are located elsewhere
    ohlc_csv = "vn30_ohlc_synthetic.csv"
    strategy_json = "strategy_samples.json"

    # Load data
    try:
        ohlc_df = load_ohlc(ohlc_csv)
    except FileNotFoundError:
        print(f"Error: OHLC file '{ohlc_csv}' not found.")
        return
    except Exception as e:
        print(f"Error loading OHLC data: {e}")
        return

    try:
        strategies = load_strategies(strategy_json)
    except FileNotFoundError:
        print(f"Error: Strategy file '{strategy_json}' not found.")
        return
    except Exception as e:
        print(f"Error loading strategies: {e}")
        return

    if not strategies:
        print("No strategies loaded. Nothing to compute.")
        return

    # Compute risk for each strategy
    total_weight = 0.0
    weighted_score_sum = 0.0

    for strat in strategies:
        symbol = strat.symbol
        # Filter OHLC data for this symbol
        asset_df = ohlc_df[ohlc_df["symbol"] == symbol].copy()
        if asset_df.empty:
            print(f"Warning: No OHLC data found for symbol '{symbol}'. Skipping.")
            continue
        # Keep only the 'close' column; compute_risk_score expects a 'close' column
        asset_close = asset_df[["close"]]
        try:
            score, mdd = compute_risk_score(asset_close, strat)
        except ImportError:
            print(
                "Error: chronos-forecasting library is not installed. "
                "Please install it with 'pip install \"chronos-forecasting>=2.0\"' and rerun."
            )
            return
        except Exception as e:
            print(f"Error computing risk for {symbol}: {e}")
            continue

        # Determine risk category
        risk_level = categorize_risk_score(score)
        # Print results for this asset
        print(
            f"{symbol}: Risk Score = {score}/100 ({risk_level}), "
            f"Expected Maximum Drawdown = {mdd:.2%}"
        )

        # Accumulate weighted score for the portfolio
        total_weight += strat.position_size_pct
        weighted_score_sum += score * strat.position_size_pct

    # Compute portfolio-level risk if we have weights
    if total_weight > 0:
        portfolio_score = weighted_score_sum / total_weight
        portfolio_risk_level = categorize_risk_score(int(round(portfolio_score)))
        print(
            f"\nPortfolio Risk Score (weighted average): {portfolio_score:.1f}/100 "
            f"({portfolio_risk_level})"
        )


if __name__ == "__main__":
    main()
