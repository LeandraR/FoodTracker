// Initialize Firebase
var config = {
    apiKey: "AIzaSyDjOZYeHYU1gc7YLAbhuDKaKhQ8--1f1f8",
    authDomain: "food-tracker-90c0e.firebaseapp.com",
    databaseURL: "https://food-tracker-90c0e.firebaseio.com",
    projectId: "food-tracker-90c0e",
    storageBucket: "",
    messagingSenderId: "277573844017"
};
firebase.initializeApp(config);
var database = firebase.database();

var food = "";
var calories = "";
var fat = '';
var carbs = '';
var protein = '';
$(".table-area").hide();
$(".img-hide").hide();
$("#pairing-text").hide();
$("#wineIntro").hide();

$("#add-meal").on("click", function (event) {
    event.preventDefault();
    $('html').scrollTop(0);
    //this will empty the wine area
    $("#wineArea").empty();
    $("#pairing-text").empty();
    $("#fallback-Food").empty();
    var Food = $("#meal").val().trim();
    var food = Food.toLowerCase();
    $("#meal").val("");
    if (localStorage.getItem(food + "nutrition")) {
        var getNutrition = JSON.parse(localStorage.getItem(food + "nutrition"));
        // console.log(getNutrition);
        $(".table-area").show();
        $(".img-hide").show();
        $("#calories-input").text(getNutrition.calories);
        $("#fat-input").text(getNutrition.fat);
        $("#carbohydrates-input").text(getNutrition.carbohydrates);
        $("#protein-input").text(getNutrition.protein);
        findWine();
    } else {
        $.ajax({
            url: "https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/guessNutrition?title=" + food,
            method: "GET",
            headers: {
                "X-Mashape-Key": "mWSYqC5gHvmshnuUYlyxmn2HId5zp1uP4wHjsnKKFlHkkIhAvq",
                "X-Mashape-Host": "spoonacular-recipe-food-nutrition-v1.p.mashape.com"
            }
        }).then(function (response) {
            //error for food not in spoonacular
            if (response.status === "error") {
                var fallBackFood = $("<p> Sorry that food is not in our database, please try something else </p>");
                console.log("lol");
                $("#fallback-Food").append(fallBackFood);
                $(".table-area").hide();
                $(".img-hide").hide();
                $("#wineIntro").hide();
            } else {
                $(".table-area").show();
                $(".img-hide").show();
                console.log(response);
                var calories = response.calories.value;
                var carbs = response.carbs.value;
                var fat = response.fat.value;
                var protein = response.protein.value;
                // console.log(calories, carbs, fat, protein);
                $("#calories-input").text(calories);
                $("#fat-input").text(fat);
                $("#carbohydrates-input").text(carbs);
                $("#protein-input").text(protein);
                // Pushing meal and macro values to the database
                var nutrition = {
                    "recipe": food,
                    "calories": calories,
                    "carbohydrates": carbs,
                    "fat": fat,
                    "protein": protein
                }
                database.ref("/" + food).push(nutrition);
                // Adding it to local storage
                // localStorage.clear();  --------- left this commented, just in case that we don't want to clear previous activity
                localStorage.setItem(food + "nutrition", JSON.stringify(nutrition));
                // console.log(JSON.parse(localStorage.getItem("nutrition")));
                //If we need to retrieve the object from local storage, we can use a variable for the retrieved object:
                var getNutrition = JSON.parse(localStorage.getItem("nutrition-" + food));
                findWine();
            }
        });
    }

    function findWine() {
        // Capture values from text boxes
        $.ajax({
            url: "https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/food/wine/pairing?food=" + food + "&maxPrice=100",
            method: "GET",
            headers: {
                "X-Mashape-Key": "mWSYqC5gHvmshnuUYlyxmn2HId5zp1uP4wHjsnKKFlHkkIhAvq",
                "X-Mashape-Host": "spoonacular-recipe-food-nutrition-v1.p.mashape.com"
            }
        }).then(function (response) {
            if (response.status === "failure" || response.pairedWines.length === 0) {
                var fallBackWine = $("<p id='wineError'> Sorry, we don't have any paired wines in our database </p>");
                $("#wineArea").append(fallBackWine);
                $("#wineIntro").hide();
            } else {
                // console.log(response);
                //shows the top 3 wines for i=[0,2]
                // console.log(response.pairedWines)
                // //shows wine pairing text for whatever food
                // console.log(response.pairingText)
                $("#pairing-text").html(response.pairingText);
                $('#pairing-text').show();
                $("#wineIntro").show();
                wineChoice = response.pairedWines;
                for (var i = 0; i < 3; i++) {
                    // console.log(wineChoice[i]);
                    wineCall();
                }
            }
            //this function will query the LCBO wine API for each of the three top wine pairings
            function wineCall() {
                $.ajax({
                    url: 'https://lcboapi.com/products?q=' + wineChoice[i],
                    method: 'GET',
                    headers: {
                        'Authorization': 'Token MDo3ODA1OGJkZS02ODVjLTExZTgtYjkzOC1lZjUyYjNkMDRlMzI6bmE5azVHdVlyN1FSaEc4V2hJOU1aUUFpM3pNNTFYR3RsQXRF'
                    }
                }).then(function (response) {
                    var randomNumber = Math.floor(Math.random() * (response.result.length - 0 + 1)) + 0;
                    console.log(response);
                    var wineLCBO = response.result[randomNumber];
                    var price = (wineLCBO.price_in_cents) / 100
                    displayWine();
                    var newWine = { //left side - firebase, right side - var from your code
                        "type": wineLCBO.varietal,
                        "name": wineLCBO.name,
                        'food': food,
                        "price": (wineLCBO.price_in_cents) / 100,
                        'sugar': wineLCBO.sugar_in_grams_per_liter,
                        'package': wineLCBO.package,
                        'tags': wineLCBO.tags,
                        'style': wineLCBO.style,
                        'imageURL': wineLCBO.image_url
                    }
                    function displayWine() {
                        var cardCol = $("<div class='col l4 m9 offset-m1 s10 offset-s1'>")
                        var cardImage = $("<div class='card-image'>")
                        var onHoverInfo = $("<div class='card-reveal' id='hover-wine'>")
                        var textInfo = $("<p>");
                        var innerText = "Price: $" + price + "<br>" + "Sugar (g/L): " + wineLCBO.sugar_in_grams_per_liter + "<br>" + wineLCBO.style
                        textInfo.html(innerText);
                        onHoverInfo.append(textInfo);
                        var wineImg = $("<img id='wineImage'>");
                        wineImg.attr('src', wineLCBO.image_url);
                        var wineTitle = $("<span class='card-title'>");
                        wineTitle.text(wineLCBO.name);
                        cardImage.append(onHoverInfo, wineImg, wineTitle);
                        cardCol.append(cardImage);
                        $("#wineArea").append(cardCol);
                    }
                    //this will display each of the three wine pairings under a new folder in firebase with the title of the food var
                    database.ref('/' + food).push(newWine);
                    //adds to local storage the food and wine variety as key and name of wine as value
                    localStorage.setItem(food + wineLCBO.varietal, JSON.stringify(newWine));
                });
            }
        });
    }
    //Food Images API
    $.ajax({
        url: 'https://pixabay.com/api/?key=' + '9191233-f0142d44da13f3353c64ec9fc' + '&q=' + food + '+food' + '&image_type=photo&safesearch=true',
        method: 'GET',
        // key: '9191233-f0142d44da13f3353c64ec9fc'
    }).then(function (response) {
        // console.log(response);
        //adding food image to page
        var foodImage = $("<img>");
        var foodImageURL = response.hits[0].largeImageURL;
        foodImage.attr('src', foodImageURL);
        $('.img-hide').html(foodImage);
    })
});

$('.carousel').carousel({
    // fullWidth: true,
    indicators: true,
    padding: 0,
});
autoplay()

function autoplay() {
    $('.carousel').carousel('next');
    setTimeout(autoplay, 3000);
}