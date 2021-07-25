import numpy as np
import pandas as pd
from flask import Flask, render_template, request, Response, jsonify
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import json
import bs4 as bs
import urllib.request
import pickle
import requests
import sys

# load the nlp model and tfidf vectorizer from disk
filename = 'nlp_model.pkl'
clf = pickle.load(open(filename, 'rb'))
vectorizer = pickle.load(open('tranform.pkl','rb'))

def create_similarity():
    data = pd.read_csv('webseries-data-preprocessed1.csv')
    # creating a count matrix
    cv = CountVectorizer()
    count_matrix = cv.fit_transform(data['comb'])
    # creating a similarity score matrix
    similarity = cosine_similarity(count_matrix)
    # print(similarity, flush=True)
    # print(similarity, file=sys.stdout)
    sys.stdout.flush()
    return data,similarity

def rcmd(m):
    m = m.lower()
    try:
        data.head()
        similarity.shape
    except:
        data, similarity = create_similarity()
    if m not in data['Series Title'].unique():
        return('Sorry! The movie you requested is not in our database. Please check the spelling or try with some other movies')
    else:
        i = data.loc[data['Series Title']==m].index[0]
        lst = list(enumerate(similarity[i]))
        lst = sorted(lst, key = lambda x:x[1] ,reverse=True)
        lst = lst[1:11] # excluding first item since it is the requested movie itself
        l = []
        for i in range(len(lst)):
            a = lst[i][0]
            l.append(data['Series Title'][a])
        return l
    
# converting list of string to list (eg. "["abc","def"]" to ["abc","def"])
def convert_to_list(my_list):
    my_list = my_list.split('","')
    my_list[0] = my_list[0].replace('["','')
    my_list[-1] = my_list[-1].replace('"]','')
    return my_list

def get_suggestions():
    data = pd.read_csv('webseries-data-preprocessed1.csv')
    return list(data['Series Title'].str.capitalize())

app = Flask(__name__)

@app.route("/")
@app.route("/home")
def home():
    suggestions = get_suggestions()
    return render_template('home.html',suggestions=suggestions)

@app.route("/similarity",methods=["POST"])
def similarity():
    movie = request.form['name']
    rc = rcmd(movie)
    if type(rc)==type('string'):
        return rc
    else:
        m_str="---".join(rc)
        return m_str

@app.route("/details",methods=["GET"])#/details/<title>
def details():
    print("called-details-func_route")
    title = request.args.get("title")
    #title=request.params
    #print(title)
    # title=title.replace(np.nan, 'unknown')
    title=title.lower()
    data = pd.read_csv('webseries-data-preprocessed1.csv')
    #print(type(data.loc[data["Series Title"]==title,['Series Title','Streaming Platform','Genre','Description','IMDB Rating','No of Seasons','Year Released','comb']]))
    details=data.loc[data["Series Title"]==title,['Series Title','Streaming Platform','Genre','Description','IMDB Rating','No of Seasons','Year Released','comb']]
    #details = details.loc[:,['Series Title','Streaming Platform','Genre','Description','IMDB Rating','No of Seasons','Year Released','comb']]

    #as in js it wont recog spaced word(ex:Series Title) as var or fetching it is not possible to renaming to convenient way(only to which requires, if it is non-spaced or ok then dont change)
    details["SeriesTitle"]=details["Series Title"]
    details["StreamingPlatform"]=details["Streaming Platform"]
    details["IMDBRating"]=details["IMDB Rating"]
    details["NoofSeasons"]=details["No of Seasons"]
    details["YearReleased"]=details["Year Released"]
    print(details)
    jsonfiles = json.loads(details.to_json(orient='records')) #, mimetype/content_type='application/json'
    print(jsonfiles)
    # jsondata=jsonify(details)
    # print(jsondata)
    return jsonify(jsonfiles) #"w" Response()//TypeError: 'Response' object is not iterable

@app.route("/recommend",methods=["POST"])
def recommend():
    # getting data from AJAX request
    title = request.form['title']
    # genres = request.form['genres']
    streamingplatform = request.form['streamingplatform']
    imdbrating = request.form['imdbrating']             
    noofseasons = request.form['noofseasons']               
    yearreleased = request.form['yearreleased']
    webseriesname = request.form['webseriesname']   

    description = request.form['description']      
    # cast_ids = request.form['cast_ids']
    # cast_names = request.form['cast_names']
    # cast_chars = request.form['cast_chars']
    # cast_bdays = request.form['cast_bdays']
    # cast_bios = request.form['cast_bios']
    # cast_places = request.form['cast_places']
    # cast_profiles = request.form['cast_profiles']
    imdb_id = request.form['imdb_id']
    poster = request.form['poster']
    genres = request.form['genres']
    # overview = request.form['overview']
    # vote_average = request.form['rating']
    # vote_count = request.form['vote_count']
    # release_date = request.form['release_date']
    # runtime = request.form['runtime']
    # status = request.form['status']
    rec_webseries = request.form['rec_webseries']
    rec_posters = request.form['rec_posters']

    # get movie suggestions for auto complete
    suggestions = get_suggestions()

    # call the convert_to_list function for every string that needs to be converted to list
    rec_webseries = convert_to_list(rec_webseries)
    rec_posters = convert_to_list(rec_posters)
    # cast_names = convert_to_list(cast_names)
    # cast_chars = convert_to_list(cast_chars)
    # cast_profiles = convert_to_list(cast_profiles)
    # cast_bdays = convert_to_list(cast_bdays)
    # cast_bios = convert_to_list(cast_bios)
    # cast_places = convert_to_list(cast_places)
    
    # convert string to list (eg. "[1,2,3]" to [1,2,3])
    # cast_ids = cast_ids.split(',')
    # cast_ids[0] = cast_ids[0].replace("[","")
    # cast_ids[-1] = cast_ids[-1].replace("]","")
    
    # rendering the string to python string
    # for i in range(len(cast_bios)):
    #     cast_bios[i] = cast_bios[i].replace(r'\n', '\n').replace(r'\"','\"')
    
    # combining multiple lists as a dictionary which can be passed to the html file so that it can be processed easily and the order of information will be preserved
    # (*)causing prob while creating dict as key(pic url was same/unique) so "<pic_url>":last rec_array_element was only coming in dict
    # webseries_cards = {rec_posters[i]: rec_webseries[i] for i in range(len(rec_posters))}
    
    # casts = {cast_names[i]:[cast_ids[i], cast_chars[i], cast_profiles[i]] for i in range(len(cast_profiles))}

    # cast_details = {cast_names[i]:[cast_ids[i], cast_profiles[i], cast_bdays[i], cast_places[i], cast_bios[i]] for i in range(len(cast_places))}

    # web scraping to get user reviews from IMDB site
    # reviews-->sentiment anaylsis for webseries can be done using scrapping/no api/no scrapping data(as of now(updated @ 05/01/21 started earlier in 1-2-3-4 months))(if api exists)/etc,.-->model is ready(clf-->nlp_model.pkl)
    # sauce = urllib.request.urlopen('https://www.imdb.com/title/{}/reviews?ref_=tt_ov_rt'.format(imdb_id)).read()
    # soup = bs.BeautifulSoup(sauce,'lxml')
    # soup_result = soup.find_all("div",{"class":"text show-more__control"})

    # reviews_list = [] # list of reviews
    # reviews_status = [] # list of comments (good or bad)
    # for reviews in soup_result:
    #     if reviews.string:
    #         reviews_list.append(reviews.string)
    #         # passing the review to our model
    #         movie_review_list = np.array([reviews.string])
    #         movie_vector = vectorizer.transform(movie_review_list)
    #         pred = clf.predict(movie_vector)
    #         reviews_status.append('Good' if pred else 'Bad')

    # # combining reviews and comments into a dictionary
    # movie_reviews = {reviews_list[i]: reviews_status[i] for i in range(len(reviews_list))}     

    # # passing all the data to the html file
    # return render_template('recommend.html',title=title,poster=poster,overview=overview,vote_average=vote_average,
    #     vote_count=vote_count,release_date=release_date,runtime=runtime,status=status,genres=genres,
    #     movie_cards=movie_cards,reviews=movie_reviews,casts=casts,cast_details=cast_details)

    print("called-recommend-func_route")
    # print(rec_webseries)
    # print(webseries_cards)
    # print(rec_posters)
    webseries_cards = {}

    # (*)causing prob while creating dict as key(pic url was same/unique) so "<pic_url>":last rec_array_element was only coming in dict
    for i in range(len(rec_posters)):
        #print(rec_webseries[i])
        #print(rec_posters[i])
        webseries_cards[rec_posters[i]]=rec_webseries[i]
    print(webseries_cards)
        
    return render_template('recommend.html',title=title,poster=poster,overview="",vote_average="",
        vote_count="",release_date="",runtime="",status="",genres=genres,
        webseries_cards=webseries_cards,reviews={},casts={},cast_details={}, streamingplatform=streamingplatform, imdbrating=imdbrating, noofseasons=noofseasons, yearreleased=yearreleased, webseriesname=webseriesname, description=description)
if __name__ == '__main__':
    app.run(debug=True, port=80)
