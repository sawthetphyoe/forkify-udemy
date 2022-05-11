import * as model from './model.js';
import { MODEL_CLOSE_SEC } from './config';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarkView from './views/bookmarkView.js';
import uploadRecipeView from './views/uploadRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime/runtime';

// https://forkify-api.herokuapp.com/v2

if (module.hot) {
  module.hot.accept();
}
///////////////////////////////////////

const controlRecipe = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    // Loading Recipe
    await model.loadRecipe(id);

    // Rendering recipe
    recipeView.render(model.state.recipe);

    // re-Render results to mark current rendered recipe
    resultsView.renderUpdate(model.getSearchResultsPage());

    // re-Render bookmark to mark current rendered recipe
    bookmarkView.renderUpdate(model.state.bookmarks);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    // Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // Load search results
    await model.loadSearchResults(query);

    // Render results
    resultsView.render(model.getSearchResultsPage());

    // Render pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (gotoPage) {
  // Render new results
  resultsView.render(model.getSearchResultsPage(gotoPage));

  // Render new pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings);

  // Update the recipe with updated servings
  recipeView.renderUpdate(model.state.recipe);
};

const controlAddBookmark = function () {
  // Toggle the bookmarked property of the recipe
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // re-Render the recipe
  recipeView.renderUpdate(model.state.recipe);

  // re-Render the bookmark
  bookmarkView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  // Render bookmark
  bookmarkView.render(model.state.bookmarks);
};

const controlUploadRecipe = async function (newRecipe) {
  try {
    // Show loading spinner
    uploadRecipeView.renderSpinner();

    // Upload the new recipe data to Flokify server
    await model.uploadRecipe(newRecipe);

    // Show success message
    uploadRecipeView.renderMessage();

    // Immediately render the uploaded recipe
    recipeView.render(model.state.recipe);

    // Render bookmark
    bookmarkView.render(model.state.bookmarks);

    // Close the success message model in a period of time
    setTimeout(function () {
      uploadRecipeView.hideWindow();
    }, MODEL_CLOSE_SEC * 1000);

    // Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
  } catch (err) {
    console.error('🙃', err);
    uploadRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarkView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipe);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHaldlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  uploadRecipeView.addHandlerUpload(controlUploadRecipe);
};
init();
