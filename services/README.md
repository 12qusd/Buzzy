# Buzzy Python Services Tooling

This directory contains the shared Python tooling and configuration for the
Buzzy ingestion and summarization services.

- **Python version:** 3.12 (see `.python-version`)
- **Dependencies:** managed via `services/requirements.txt`
- **Formatting:** [Black](https://black.readthedocs.io/) configured via `pyproject.toml`
- **Testing:** [pytest](https://docs.pytest.org/) configured via `pyproject.toml`

## Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r services/requirements.txt
```

## Commands

From the repository root:

```bash
# Run tests for all Python services
pytest services

# Format all Python code
black services

# Check formatting without modifying files
black --check services
```
