
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';

import {
getFirestore,
collection,
addDoc,
onSnapshot,
deleteDoc,
doc,
updateDoc
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const firebaseConfig = {
apiKey: "AIzaSyCAfxxQiBH215y4-zO_5b8yJHk4l7nxydk",
authDomain: "recipe-green-stone.firebaseapp.com",
projectId: "recipe-green-stone",
storageBucket: "recipe-green-stone.firebasestorage.app",
messagingSenderId: "140902106541",
appId: "1:140902106541:web:1b5a09a8c3fe821a5a4d24",
measurementId: "G-5KZCBX4Z7Q"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const form = document.getElementById("recipeForm");
const recipesContainer = document.getElementById("recipesContainer");
const searchInput = document.getElementById("searchInput");
const formTitle = document.getElementById("formTitle");
const saveBtn = document.getElementById("saveBtn");

let recipes = [];
let editRecipeId = null;

const recipesCollection = collection(db, "recipes");

onSnapshot(recipesCollection, (snapshot) => {
recipes = snapshot.docs.map(docItem => ({
firebaseId: docItem.id,
...docItem.data()
}));

renderRecipes();
});

function renderRecipes() {

const searchText = searchInput.value.toLowerCase();

recipesContainer.innerHTML = "";

const filtered = recipes.filter(recipe =>
recipe.title.toLowerCase().includes(searchText) ||
recipe.mealType.toLowerCase().includes(searchText) ||
recipe.ingredients.toLowerCase().includes(searchText)
);

if (filtered.length === 0) {
recipesContainer.innerHTML = "<p>No recipes found.</p>";
return;
}

filtered.reverse().forEach(recipe => {

const card = document.createElement("div");

card.className = "recipe-card";

card.innerHTML = `
${recipe.image ? `<img src="${recipe.image}" alt="${recipe.title}">` : ""}

<div class="recipe-content">

<h3>${recipe.title}</h3>

<p><strong>${recipe.mealType}</strong></p>

<h4>Ingredients</h4>
<p>${recipe.ingredients}</p>

<h4>Preparation</h4>
<p>${recipe.preparation}</p>

${recipe.video ? `<p><a href="${recipe.video}" target="_blank">Watch Video</a></p>` : ""}

<button class="edit-btn" data-id="${recipe.firebaseId}">
Edit
</button>

<button class="delete-btn" data-id="${recipe.firebaseId}">
Delete
</button>

</div>
`;

recipesContainer.appendChild(card);

});

setupButtons();
}

function setupButtons() {

document.querySelectorAll(".delete-btn").forEach(button => {

button.addEventListener("click", async () => {

await deleteDoc(doc(db, "recipes", button.dataset.id));

});
});

document.querySelectorAll(".edit-btn").forEach(button => {

button.addEventListener("click", () => {

editRecipe(button.dataset.id);

});
});
}

form.addEventListener("submit", async (e) => {

e.preventDefault();

const file = document.getElementById("imageUpload").files[0];

if (file) {

const reader = new FileReader();

reader.onload = async function(event) {

await saveRecipe(event.target.result);

};

reader.readAsDataURL(file);

} else {

const existingImage = editRecipeId
? recipes.find(r => r.firebaseId === editRecipeId)?.image || ""
: "";

await saveRecipe(existingImage);
}
});

async function saveRecipe(imageData) {

const recipeData = {
title: document.getElementById("title").value,
mealType: document.getElementById("mealType").value,
image: imageData,
ingredients: document.getElementById("ingredients").value,
preparation: document.getElementById("preparation").value,
video: document.getElementById("video").value
};

if (editRecipeId) {

await updateDoc(doc(db, "recipes", editRecipeId), recipeData);

editRecipeId = null;

formTitle.innerText = "Add Recipe";
saveBtn.innerText = "Save Recipe";

} else {

await addDoc(recipesCollection, recipeData);

}

form.reset();
}

function editRecipe(id) {

const recipe = recipes.find(r => r.firebaseId === id);

document.getElementById("title").value = recipe.title;
document.getElementById("mealType").value = recipe.mealType;
document.getElementById("ingredients").value = recipe.ingredients;
document.getElementById("preparation").value = recipe.preparation;
document.getElementById("video").value = recipe.video;

editRecipeId = id;

formTitle.innerText = "Edit Recipe";
saveBtn.innerText = "Update Recipe";
}

searchInput.addEventListener("input", renderRecipes);
