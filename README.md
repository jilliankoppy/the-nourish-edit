# The Nourish Edit

Eat well. Feel good. Plan beautifully.

A static meal-planning website with 32 recipes, a weekly planner, a grocery list, saved favorites, a recipe finder, and a kitchen ingredient matcher.

## Run locally

From this directory, run `python3 -m http.server 8000` and open http://localhost:8000. There are no dependencies or build steps.

## Publish on GitHub Pages

In the repository’s **Settings → Pages**, select **Deploy from a branch**, then **main** and **/ (root)**. The website uses relative asset URLs and hash navigation, so it works under the repository path.

The meal plan, saved recipes, grocery changes, and finder preferences use browser localStorage. Data stays with the browser profile and origin. Active prep and cook times exclude any chilling indicated in a recipe. Dietary tags assume compatible packaged ingredients. The food images are generated illustrations of the dishes and may include optional styling ingredients.
