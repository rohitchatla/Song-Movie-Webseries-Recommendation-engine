$(function () {
  // Button will be disabled until we type anything inside the input field
  const source = document.getElementById("autoComplete");
  const inputHandler = function (e) {
    if (e.target.value == "") {
      //console.log("called");
      $(".movie-button").attr("disabled", true);
    } else {
      //console.log("called");
      $(".movie-button").attr("disabled", false);
    }
  };
  source.addEventListener("input", inputHandler);

  $(".movie-button").on("click", function () {
    var my_api_key = "a28f92b4a1e47d20d2897ccc780e8b22";
    var title = $(".movie").val();
    //document.write(title);
    console.log("called");
    //movie_recs(movie_title, "1", my_api_key);
    if (title == "") {
      //$(".results").css("display", "none");
      //$(".fail").css("display", "block");
    } else {
      load_details(my_api_key, title);
    }
  });
});

// will be invoked when clicking on the recommended movies
function recommendcard(e) {
  var my_api_key = "a28f92b4a1e47d20d2897ccc780e8b22";
  var title = e.getAttribute("title");
  load_details(my_api_key, title);
}

// get the basic details of the movie from the API (based on the name of the movie)
function load_details(my_api_key, title) {
  console.log(title); //lowercased in main.py only from dataframe(so no need to do here in recommend.js)
  /*url:
      "https://api.themoviedb.org/3/search/movie?api_key=" +
      my_api_key +
      "&query=" +
      title, */
  //url: "details" + "&title=" + title,
  //url: "details/" + title,
  //url: "details" + "?title=" + title,
  $.ajax({
    type: "GET",
    url: "details" + "?title=" + title,
    success: function (song) {
      console.log(song);
      if (song.length < 1) {
        $(".fail").css("display", "block");
        $(".results").css("display", "none");
        $("#loader").delay(500).fadeOut();
      } else {
        $("#loader").fadeIn();
        $(".fail").css("display", "none");
        $(".results").delay(1000).css("display", "block");
        var song_id = Math.floor(Math.random() * 101); //0-100//song[0].id;
        print(song);
        var song_title = song[0].SongName;
        song_recs(song_title, song_id, my_api_key);
      }
    },
    error: function () {
      alert("Invalid Request");
      $("#loader").delay(500).fadeOut();
    },
  });
}

// passing the movie name to get the similar movies from python's flask
function song_recs(song_title, song_id, my_api_key) {
  $.ajax({
    type: "POST",
    url: "/similarity",
    data: { name: song_title },
    success: function (recs) {
      if (
        recs ==
        "Sorry! The song you requested is not in our database. Please check the spelling or try with some other songs"
      ) {
        $(".fail").css("display", "block");
        $(".results").css("display", "none");
        $("#loader").delay(500).fadeOut();
      } else {
        console.log(recs);
        $(".fail").css("display", "none");
        $(".results").css("display", "block");
        var song_arr = recs.split("---");
        var arr = [];
        for (const song in song_arr) {
          arr.push(song_arr[song]);
        }
        console.log(song_arr);
        console.log(arr);
        get_song_details(song_id, my_api_key, arr, song_title);
      }
    },
    error: function () {
      alert("error recs");
      $("#loader").delay(500).fadeOut();
    },
  });
}

// get all the details of the movie using the movie id.

/* url:
"https://api.themoviedb.org/3/movie/" +
movie_id +
"?api_key=" +
my_api_key,*/

function get_song_details(song_id, my_api_key, arr, song_title) {
  $.ajax({
    type: "GET",
    url: "details" + "?title=" + song_title,
    success: function (song_details) {
      console.log(song_details);
      show_details(song_details, arr, song_title, my_api_key, song_id);
    },
    error: function () {
      alert("API Error!");
      $("#loader").delay(500).fadeOut();
    },
  });
}

// passing all the details to python's flask for displaying and scraping the movie reviews using imdb id
function show_details(song_details, arr, song_title, my_api_key, song_id) {
  var imdb_id = song_id; //song_details.imdb_id;
  //var poster = "https://image.tmdb.org/t/p/original" + movie_details.poster_path;
  var poster = "https://imaging.nikon.com/lineup/dslr/df/img/sample/img_01.jpg";
  //var overview = movie_details.overview;
  var genres = song_details[0].Genre;
  var album = song_details[0].AlbumMovie;
  var singers = song_details[0].SingerArtists;
  var songname = song_details[0].SongName;
  var userrating = song_details[0].UserRating;
  // var rating = movie_details.vote_average;
  // var vote_count = movie_details.vote_count;
  // var release_date = new Date(movie_details.release_date);
  // var runtime = parseInt(movie_details.runtime);
  // var status = movie_details.status;
  // var genre_list = [];
  // for (var genre in genres) {
  //   genre_list.push(genres[genre].name);
  // }
  var my_genre = song_details[0].Genre; //genre_list.join(", ");
  // if (runtime % 60 == 0) {
  //   runtime = Math.floor(runtime / 60) + " hour(s)";
  // } else {
  //   runtime =
  //     Math.floor(runtime / 60) + " hour(s) " + (runtime % 60) + " min(s)";
  // }
  arr_poster = get_song_posters(arr, my_api_key);

  // movie_cast = get_movie_cast(movie_id, my_api_key);

  // ind_cast = get_individual_cast(movie_cast, my_api_key);

  details = {
    title: song_title,
    //genres: genres,
    album: album,
    singers: singers,
    songname: songname,
    userrating: userrating,
    // cast_ids: JSON.stringify(movie_cast.cast_ids),
    // cast_names: JSON.stringify(movie_cast.cast_names),
    // cast_chars: JSON.stringify(movie_cast.cast_chars),
    // cast_profiles: JSON.stringify(movie_cast.cast_profiles),
    // cast_bdays: JSON.stringify(ind_cast.cast_bdays),
    // cast_bios: JSON.stringify(ind_cast.cast_bios),
    // cast_places: JSON.stringify(ind_cast.cast_places),
    imdb_id: imdb_id,
    poster: poster,
    genres: my_genre,
    // overview: overview,
    // rating: rating,
    // vote_count: vote_count.toLocaleString(),
    // release_date: release_date.toDateString().split(" ").slice(1).join(" "),
    // runtime: runtime,
    // status: status,
    rec_songs: JSON.stringify(arr),
    rec_posters: JSON.stringify(arr_poster),
  };

  $.ajax({
    type: "POST",
    data: details,
    url: "/recommend",
    dataType: "html",
    complete: function () {
      $("#loader").delay(500).fadeOut();
    },
    success: function (response) {
      $(".results").html(response);
      $("#autoComplete").val("");
      $(window).scrollTop(0);
    },
  });
}

// get the details of individual cast
function get_individual_cast(movie_cast, my_api_key) {
  cast_bdays = [];
  cast_bios = [];
  cast_places = [];
  for (var cast_id in movie_cast.cast_ids) {
    $.ajax({
      type: "GET",
      url:
        "https://api.themoviedb.org/3/person/" +
        movie_cast.cast_ids[cast_id] +
        "?api_key=" +
        my_api_key,
      async: false,
      success: function (cast_details) {
        cast_bdays.push(
          new Date(cast_details.birthday)
            .toDateString()
            .split(" ")
            .slice(1)
            .join(" ")
        );
        cast_bios.push(cast_details.biography);
        cast_places.push(cast_details.place_of_birth);
      },
    });
  }
  return {
    cast_bdays: cast_bdays,
    cast_bios: cast_bios,
    cast_places: cast_places,
  };
}

// getting the details of the cast for the requested movie
function get_movie_cast(movie_id, my_api_key) {
  cast_ids = [];
  cast_names = [];
  cast_chars = [];
  cast_profiles = [];

  top_10 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  $.ajax({
    type: "GET",
    url:
      "https://api.themoviedb.org/3/movie/" +
      movie_id +
      "/credits?api_key=" +
      my_api_key,
    async: false,
    success: function (my_movie) {
      if (my_movie.cast.length >= 10) {
        top_cast = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      } else {
        top_cast = [0, 1, 2, 3, 4];
      }
      for (var my_cast in top_cast) {
        cast_ids.push(my_movie.cast[my_cast].id);
        cast_names.push(my_movie.cast[my_cast].name);
        cast_chars.push(my_movie.cast[my_cast].character);
        cast_profiles.push(
          "https://image.tmdb.org/t/p/original" +
            my_movie.cast[my_cast].profile_path
        );
      }
    },
    error: function () {
      alert("Invalid Request!");
      $("#loader").delay(500).fadeOut();
    },
  });

  return {
    cast_ids: cast_ids,
    cast_names: cast_names,
    cast_chars: cast_chars,
    cast_profiles: cast_profiles,
  };
}

// getting posters for all the recommended movies
function get_song_posters(arr, my_api_key) {
  var arr_poster_list = [];
  for (var m in arr) {
    // $.ajax({
    //   type: "GET",
    //   url:
    //     "https://api.themoviedb.org/3/search/movie?api_key=" +
    //     my_api_key +
    //     "&query=" +
    //     arr[m],
    //   async: false,
    //   success: function (m_data) {
    //     arr_poster_list.push(
    //       "https://image.tmdb.org/t/p/original" + m_data.results[0].poster_path
    //     );
    //   },
    //   error: function () {
    //     alert("Invalid Request!");
    //     $("#loader").delay(500).fadeOut();
    //   },
    // });

    // random image fetching
    // fetch(`https://source.unsplash.com/1600x900/?beach`).then((response) => {
    //   // let item = document.createElement("div");
    //   // item.classList.add("item");
    //   // item.innerHTML = `<img class="beach-image" src="${response.url}" alt="beach image"/>`;
    //   // document.body.appendChild(item);
    //   console.log(response.url);
    //   arr_poster_list.push(response.url);
    // });

    // same image adding till recommendation array size
    arr_poster_list.push(
      "https://imaging.nikon.com/lineup/dslr/df/img/sample/img_01.jpg" +
        "?" +
        Math.floor(Math.random() * 101) //0-100
    );
  }
  console.log(arr_poster_list);
  return arr_poster_list;
}
