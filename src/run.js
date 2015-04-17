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
        var indexToFetch = process.argv[2];
        console.log('asking for ' + chalk.yellow(indexToFetch));
        if(!indexToFetch){
            return false;
        }
        _.each(allDatas, function(pl, key){
            if(indexToFetch === pl.name){
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
                                    console.log(chalk.red('/!\\ ') + 'failed for ' + track.artist + ' - ' + track.title);
                                    OUTPUT.push('ERROR');   
                                }
                            }else{
                                OUTPUT.push('ERROR');
                                console.log(chalk.red('/!\\/!\\/!\\ ') + 'failed for ' + track.artist + ' - ' + track.title);
                            }
                            check(OUTPUT, INPUT, pl);
                        }
                        );
                    }
                });
}
});
});

var progress = '';
var check = function(OUTPUT, INPUT, pl){
    if(_.last(OUTPUT)==='ERROR'){
        progress += chalk.red('X');
    }else{
        progress += chalk.green('=');
    }
    if(OUTPUT.length === INPUT){
        console.log('[' + progress +']');
        console.log('');
        console.log('');
        console.log('');
        console.log(_.without(OUTPUT, 'ERROR').join(','));        
        console.log('');
        console.log('');
        console.log('');
        console.log('Ended export for ' + chalk.green(pl.name) + ' !');
    }
}

    // pm.getStreamUrl("Thvfmp2be3c7kbp6ny4arxckz54", console.log);
});
