# FESE_Blackguard
# Blackguard's ML Demo
Blackguard Risk Scoring Prototype

This repository contains a simple proof‑of‑concept for the machine‑learning
component of the Blackguard behavioural coaching platform. It demonstrates
how to load price data and investment strategies, invoke a pretrained
time‑series foundation model to forecast future returns, compute the expected
maximum drawdown, and map that drawdown onto a 0–100 behavioural risk score.

File structure

The project includes four primary files:

File	Purpose
vn30_ohlc_synthetic.csv	Six‑month synthetic OHLC data for the 30 VN30 stocks. Each row includes the trading date, stock symbol, and the opening, high, low and closing price. All prices are stored in thousands of Vietnamese đồng per share.
strategy_samples.json	A sample list of five investment strategies. Each entry specifies a stock ticker, an entry price (in thousands of VND), profit‑take and stop‑loss thresholds (in percent), the holding period in trading days, and the portfolio weight of the position.
chronos_risk_template.py	The core machine‑learning module. It defines data structures and helper functions to convert price data to the format expected by Chronos, loads a pretrained Chronos‑2 model, generates probabilistic price forecasts, computes the expected maximum drawdown (E[MDD]) and translates it into a risk score.
run_risk_with_template.py	A command‑line driver script. It reads the OHLC dataset and strategy file, instantiates strategy objects, calls into the risk module for each position, and prints the resulting risk score and drawdown. It also aggregates the per‑position scores into a portfolio‑level figure.
Requirements

To run the example you need:

Python 3.8 or higher. Earlier versions may work but are not tested.

The following Python packages:

pandas for data handling.

numpy for numerical computations.

chronos‑forecasting (version ≥ 2.0) from Amazon’s AutoGluon project. This package provides the pretrained Chronos‑2 model and forecasting pipeline. Install it via pip: pip install "chronos‑forecasting>=2.0".

Optional: scikit‑learn if you plan to explore alternative risk scaling methods or evaluation metrics.

You may wish to create a virtual environment before installing these packages to avoid conflicts with existing Python libraries. For example:

python -m venv .venv
source .venv/bin/activate
pip install pandas numpy chronos-forecasting>=2.0

Running the example

Ensure the four files mentioned above are located in the same directory.

Install the required Python packages as described in the previous section.

Execute the driver script from a terminal:

python run_risk_with_template.py


The script will parse the strategy file and the OHLC data, load the Chronos model (this may take a few seconds the first time), compute the expected drawdown for each strategy, convert it into a risk score, and print a report similar to:

FPT: Risk Score = 43/100 (Moderate), Expected Maximum Drawdown = 4.29%
VHM: Risk Score = 3/100 (Very Low), Expected Maximum Drawdown = 0.34%
…

Portfolio Risk Score (weighted average): 18/100 (Low)


If the chronos‑forecasting package is not installed, the script will raise an ImportError. Install the package and run again.

Optionally, modify the contents of strategy_samples.json to try different entry prices, take‑profit/stop‑loss ratios or holding periods. Make sure that the symbols listed in the strategy file exist in the OHLC dataset; otherwise the script will report a mismatch.

Customisation

While the default risk mapping uses a linear relationship between expected drawdown and a 0–100 score, you can tailor this to suit your needs. The following tweaks are common:

Reference drawdown: In chronos_risk_template.py, the constant MDD_REFERENCE sets the drawdown level corresponding to a risk score of 100. Decrease it to increase scores for small drawdowns; increase it to reduce sensitivity.

Square‑root scaling: To compress large differences in risk, you can apply a non‑linear mapping when converting expected drawdown to a score. For example, import Python’s built‑in math module and compute score = int(min(100, math.sqrt(mdd) * 100)). This yields modest scores for small drawdowns but prevents large drawdowns from overwhelming the scale.

Quantile selection: The compute_risk_score() function uses the 0.5 quantile (median) forecast. To evaluate more pessimistic scenarios, pass a higher quantile_level (e.g. 0.75 or 0.9) when calling this function.

Portfolio weighting: The driver script aggregates per‑asset scores by their position_size_pct. Adjust these values in the strategy file to reflect your own capital allocation.

Notes

The provided OHLC data is synthetic and is not intended for making real investment decisions.

The Chronos model is used in a zero‑shot mode, meaning it is not fine‑tuned on the VN30 dataset. For more accurate forecasts on real markets, you could fine‑tune the model using your own historical data.

If you use your own dataset, ensure that price columns remain positive and that the date column is parsed correctly. Update the entry_price field in the strategy file to match the units of your data.
