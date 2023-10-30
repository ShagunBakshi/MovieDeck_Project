const movieAPI = "https://api.themoviedb.org/3/movie/top_rated";
const API_Key = "f531333d637d0c44abc85b3e74db2186";
const SEARCH_API_URL = "https://api.themoviedb.org/3/search/movie";
const Image_URL = "https://image.tmdb.org/t/p/original/";
const LS_Key = "favoriteMovies";

let movies = [];
let sortByDateFlag = 1;
let sortByRatingFlag = 1;
let currentPage = 1;

// Fetch all the movies from the API 
async function fetchMovies(page = 1) {
  try {
    let response = await fetch(
      `${movieAPI}?api_key=${API_Key}&language=en-US&page=${page}`
    );
    response = await response.json();
    // console.log(response);
    movies = response.results;
   
    // We pass all the fetched movies data to the render movie function
    renderMovies(response.results)
  } catch (error) {
    console.log(error);
  }
}
 
fetchMovies();
 


// Receives a array of movies data and display on screen
function renderMovies(newMovies){
  // ul list
    const moviesList = document.getElementById("movies-list");

    // clearing movie list before rendring
    moviesList.innerHTML = "";
    // Running loop on the fetche data
    newMovies.forEach((movie) =>{
      // destructring the values from the fetched data/movies
        const {poster_path,title,vote_average,vote_count} = movie;
        // Creata a new li
        const listItem = document.createElement("li");
        // Added a class to li to apply styles
        listItem.className = "card";
        let imageSource = poster_path?`${Image_URL}/${poster_path}`: "https://ntvb.tmsimg.com/assets/p6319_v_h8_bi.jpg?w=1280&h=720"

        // Adding imageTag to li tag
        const imageTag = `<img class = 'poster' src = ${imageSource} alt = ${title}/>`;
    listItem.innerHTML += imageTag;

    // Adding titleTag to li tag
    const titleTag = `<p class='title'>${title}</p>`;
    listItem.innerHTML += titleTag;
    let sectionTag = `<section class="vote-favoriteIcon">
    <section class="vote">
        <p class="vote-count">Votes: ${vote_count}</p>
        <p class="vote-rating">Rating: ${vote_average}</p>
    </section>
    <i class="fa-regular fa-heart fa-2xl favorite-icon" id="${title}"></i>
</section>`;

// adding section tag
listItem.innerHTML += sectionTag;

const favoriteIcon = listItem.querySelector(".favorite-icon");
favoriteIcon.addEventListener("click",(event) => {
    const { id } = event.target;
    if(favoriteIcon.classList.contains("fa-solid")){
      favoriteIcon.classList.remove("fa-solid");
      removeMovieNamesToLocalStorage(id);
    } else {
      favoriteIcon.classList.add("fa-solid");
      addMovieNamesToLocalStorage(id);
    }    
});
 


// appending the li in the ul 
    moviesList.appendChild(listItem);
    });
}


// sort by date
const sortByDateButton = document.getElementById("sort-by-date");

function sortByDate(){
  let sortedMovies;
  if(sortByDateFlag === 1){
  sortedMovies = movies.sort((movie1, movie2) => {
    return new Date(movie1.release_date) - new Date(movie2.release_date);
  });
  sortByDateFlag = -1;
  sortByDateButton.textContent = "Sort by date(latest to oldest)";
} else if(sortByDateFlag === -1){
  sortedMovies = movies.sort((movie1, movie2) => {
    return new Date(movie2.release_date) - new Date(movie1.release_date);
  });
  sortByDateFlag = 1;
  sortByDateButton.textContent = "Sort by date(oldest to latest)";
}
  renderMovies(sortedMovies);
}
sortByDateButton.addEventListener("click",sortByDate);


// sort by rating
const sortByRatingButton = document.getElementById("sort-by-rating");

function sortByRating(){
  let sortedMovies;
  if(sortByRatingFlag === 1){
    sortedMovies = movies.sort((movie1, movie2) => {
    return movie1.vote_average - movie2.vote_average;
    });
    sortByRatingFlag = -1;
    sortByRatingButton.textContent = "Sort by rating(most to least)"
  } else if(sortByRatingFlag === -1){
    sortedMovies = movies.sort((movie1, movie2) => {
    return movie2.vote_average - movie1.vote_average;
    });
    sortByRatingFlag = 1;
    sortByRatingButton.textContent = "Sort by rating(least to most)";
  }
  renderMovies(sortedMovies);
}

sortByRatingButton.addEventListener("click",sortByRating);

// Pagination

const prevButton = document.getElementById("prev-button");
const pageNumberButton = document.getElementById("page-number-button");
const nextButton = document.getElementById("next-button");

prevButton.disabled = true;

prevButton.addEventListener("click",() =>{
  // decrease page by 1
  nextButton.disabled = false;
  currentPage--;
  // fetch movies by new page number
  fetchMovies(currentPage);
  pageNumberButton.textContent = `Current Page: ${currentPage}`;
  if(currentPage === 1) {
    prevButton.disabled = true;
  }
});

nextButton.addEventListener("click",() =>{
  // increase page by 1
  prevButton.disabled = false;
  currentPage++;
  // fetch movies by new page number
  fetchMovies(currentPage);
  pageNumberButton.textContent = `Current Page: ${currentPage}`;
  if(currentPage === 10){
    nextButton.disabled = true;
  }
});

const searchMovies = (async (searchedMovie) => {
  try {
  const response = await fetch(`${SEARCH_API_URL}?query=${searchedMovie}&api_key=${API_Key}&language=en-US&page=1`
  );
  const result = await response.json();
  movies = result.results;
  renderMovies(movies);
  } catch(error){
    console.log(error)
  }
});

const searchButton = document.getElementById("search-button");
const searchInput = document.getElementById("search-input");

searchButton.addEventListener("click",()=>{
  searchMovies(searchInput.value);
})


// Adding to favorite list
// getter
function getMovieNamesFromLocalStorage(){
  const favoriteMovies = JSON.parse(localStorage.getItem(LS_Key));
  return favoriteMovies === null ? [] : favoriteMovies; // or return favoriteMovies || [];
}

// setter
function addMovieNamesToLocalStorage(movieName){
  const favoriteMovies = getMovieNamesFromLocalStorage();
  const newFavoriteMovies = [...favoriteMovies,movieName];
  localStorage.setItem(LS_Key,JSON.stringify(newFavoriteMovies));  
}

// remove function
function removeMovieNamesToLocalStorage(movieName){
  const allMovies = getMovieNamesFromLocalStorage();
  const newFavoriteMovies = allMovies.filter((movie) => movie !== movieName);
  localStorage.setItem(LS_Key,JSON.stringify(newFavoriteMovies));
}

// favorite tab 
const allTab = document.getElementById("all-tab");
const favoritesTab = document.getElementById("favorites-tab");

function switchTab(event){
  // remove class from nboth tabs
  allTab.classList.remove("active-tab");
  favoritesTab.classList.remove("active-tab");

  // add class to clicked tab
  event.target.classList.add("active-tab");
  displayMovies()
}

allTab.addEventListener("click",switchTab);
favoritesTab.addEventListener("click", switchTab);


// To get all the movie data from its name by calling API
async function getMovieByName(movieName){
  try{
    const response = await fetch (
      `${SEARCH_API_URL}?query=${movieName}&api_key=${API_Key}&language=en-US&page=1`
    );
    const result = await response.json();
    // Only return first movie from response
    return result.results[0];  
  }
  catch(error){
    console.log(error);
  }
}




function showFavorites(movie){
  const moviesList = document.getElementById("movies-list");
   
      const {poster_path,title,vote_average,vote_count} = movie;
      // Creata a new li
      const listItem = document.createElement("li");
      // Added a class to li to apply styles
      listItem.className = "card";
      let imageSource = poster_path?`${Image_URL}/${poster_path}`: "https://ntvb.tmsimg.com/assets/p6319_v_h8_bi.jpg?w=1280&h=720"

      // Adding imageTag to li tag
      const imageTag = `<img class = 'poster' src = ${imageSource} alt = ${title}/>`;
  listItem.innerHTML += imageTag;

  // Adding titleTag to li tag
  const titleTag = `<p class='title'>${title}</p>`;
  listItem.innerHTML += titleTag;
  let sectionTag = `<section class="vote-favoriteIcon">
  <section class="vote">
      <p class="vote-count">Votes: ${vote_count}</p>
      <p class="vote-rating">Rating: ${vote_average}</p>
  </section>
  <i class="fa-solid fa-xmark fa-xl xmark" id="${title}"></i>
</section>`;

// adding section tag
listItem.innerHTML += sectionTag;
const removeWishlistButton = listItem.querySelector(".xmark");
removeWishlistButton.addEventListener("click",(event) => {
    const { id } = event.target;
    removeMovieNamesToLocalStorage(id);
    fetchWishlistMovie();
});

// appending the li in the ul 
    moviesList.appendChild(listItem);
    
}

// get mpovie data and display movie data
async function fetchWishlistMovie(){
   // ul/movielist 
   const moviesList = document.getElementById("movies-list");
   // clearing my movielist before rendring
   moviesList.innerHTML = "";
  const moviesNamesList = getMovieNamesFromLocalStorage();
  moviesNamesList.forEach(async(movie) => {
    const movieData = await getMovieByName(movie);
    showFavorites(movieData);
  })
}

// to toggle between all and favorites tab
function displayMovies(){
  const sortOptions = document.getElementsByClassName("sorting-options")[0];
  const pagination = document.getElementsByClassName("pagination")[0];

  if(allTab.classList.contains("active-tab")){
    renderMovies(movies);
    sortOptions.style.opacity = "revert";
    pagination.style.display = "revert";
  } else if(favoritesTab.classList.contains("active-tab")){
    fetchWishlistMovie();
    pagination.style.opacity = "0";
    sortOptions.style.opacity = "0";
  }
}




 