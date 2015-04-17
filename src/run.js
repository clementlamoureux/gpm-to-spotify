/* Example usage script.
 *
 * Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ 
 */

 var fs = require('fs');
 var _ = require('lodash');
 var chalk = require('chalk');
 var PlayMusic = require('../');
 var request = require('request');

 var spotiUrlSearchFor = function(artist, title){
   return "https://api.spotify.com/v1/search?q=" + artist + "+-+" + title + "&type=track";
}

var pm = new PlayMusic();
var config = JSON.parse(fs.readFileSync("config.json"));
pm.init(config, function() {
    var allDatas = {};

    pm.getPlayLists(function(data) {
        _.each(data.data.items, function(data){
            var id = data.id;
            allDatas[id]=data;
            allDatas[id].tracks = [];
        });
    });

    pm.getPlayListEntries(function(data) {
        _.each(data.data.items, function(item){
            if(allDatas[item.playlistId]){
                allDatas[item.playlistId].tracks.push(item.track);
            }
        });

        _.each(allDatas, function(pl, key){
            console.log('Playlist ' + chalk.green(pl.name) + ' has ' + chalk.green(pl.tracks.length) + ' tracks imported');
        });

        var a = 0, b = false;
        _.each(allDatas, function(pl, key){
            if(a){
                return false;
            }
            a++;
            console.log('Started export for ' + chalk.red(pl.name) + ' ...');
            var OUTPUT = [], INPUT=0;
            _.each(pl.tracks, function(track){
                if(track){
                    INPUT++;
                    request(
                        { method: 'GET',
                        uri: spotiUrlSearchFor(track.artist, track.title),
                        json: true,
                        gzip: true
                    }
                    , function (error, response, body) {
                        if(body && body.tracks){
                            var el = _.first(body.tracks.items);
                            if(el){
                                OUTPUT.push('spotify:track:' + el.id);
                            }else{
                                OUTPUT.push('ERROR');   
                            }
                        }else{
                            OUTPUT.push('ERROR');
                        }
                        check(OUTPUT, INPUT);
                    }
                    );
                }
            });
        });
});

var check = function(OUTPUT, INPUT){
    console.log(OUTPUT.length, INPUT);
    if(OUTPUT.length === INPUT){
        console.log(_.without(OUTPUT, 'ERROR').join(','));        
        console.log('Ended export for ' + chalk.green(pl.name) + ' !');
    }
}

    // pm.getStreamUrl("Thvfmp2be3c7kbp6ny4arxckz54", console.log);
});
