# Sofiagiuliani01.github.io

Sito web fitness e nutrizione.

## Deploy GitHub Pages

Il deploy è gestito dal workflow `.github/workflows/pages.yml`.

Il workflow:

1. parte automaticamente a ogni push sui branch `main`, `master` e `work`;
2. può essere avviato manualmente da **Actions → Deploy static site to GitHub Pages → Run workflow**;
3. pubblica direttamente i file statici presenti nella root del repository;
4. mantiene `.nojekyll` nell'artefatto, così GitHub Pages serve correttamente tutti i file statici senza passare da Jekyll.

Nelle impostazioni del repository, **Settings → Pages → Build and deployment → Source** deve essere impostato su **GitHub Actions**.
