"""Automated Hugging Face Hub dataset mirror uploader for Mohammad Golamrabbii's Open Bangla Ecosystem.

Prerequisites:
    pip install huggingface_hub datasets
    huggingface-cli login   # or export HF_TOKEN=hf_xxx

Usage:
    python push_datasets.py --username YOUR_HF_USERNAME
"""
import argparse
import os
from pathlib import Path
from huggingface_hub import HfApi


REPOS_TO_MIRROR = [
    ("Bangla-Lexicon-Mega-Archive", "bangla-lexicon-495k"),
    ("Hindi-Lexicon-Mega-Archive", "hindi-lexicon-411k"),
    ("Bangla-Hindi-Bilingual-Bridge", "bangla-hindi-bilingual-bridge"),
    ("Open-Bangla-NLP-Suite", "open-bangla-nlp-suite"),
]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--username", default=os.environ.get("HF_USER", "mohammadgolamrabbii"))
    parser.add_argument("--base-dir", default=str(Path(__file__).resolve().parents[2]))
    args = parser.parse_args()

    api = HfApi()
    base = Path(args.base_dir)
    for local_name, hf_slug in REPOS_TO_MIRROR:
        repo_path = base / local_name
        if not repo_path.exists():
            print(f"[SKIP] {repo_path} not found")
            continue
        repo_id = f"{args.username}/{hf_slug}"
        print(f"Creating/Updating HF Dataset: {repo_id}")
        api.create_repo(repo_id=repo_id, repo_type="dataset", exist_ok=True)
        dist_dir = repo_path / "dist"
        if dist_dir.exists():
            api.upload_folder(
                folder_path=str(dist_dir),
                path_in_repo="data",
                repo_id=repo_id,
                repo_type="dataset",
            )
        readme = repo_path / "huggingface_README.md"
        if readme.exists():
            api.upload_file(
                path_or_fileobj=str(readme),
                path_in_repo="README.md",
                repo_id=repo_id,
                repo_type="dataset",
            )
        print(f"Uploaded -> https://huggingface.co/datasets/{repo_id}")


if __name__ == "__main__":
    main()
