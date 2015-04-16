/* Example usage script.
 *
 * Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ 
 */

 var fs = require('fs');
 var _ = require('lodash');
 var chalk = require('chalk');
 var PlayMusic = require('../');

 var pm = new PlayMusic();
 var config = JSON.parse(fs.readFileSync("config.json"));
 pm.init(config, function() {
    // pm.getLibrary(function(library) {
    //     var song = library.data.items.pop();
    //     console.log(song);
    //     pm.getStreamUrl(song.id, function(streamUrl) {
    //         console.log(streamUrl);
    //     });
    // });

    // pm.search("bastille lost fire", 5, function(data) {
    //     var song = data.entries.sort(function(a, b) {
    //         return a.score < b.score;
    //     }).shift();
    //     console.log(song);
    //     pm.getStreamUrl(song.track.nid, function(streamUrl) {
    //         console.log(streamUrl);
    //     });
    // }, function(err) {
    //     console.log(err);
    // });
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
            allDatas[item.playlistId].tracks.push(item);
        }
    });

    _.each(allDatas, function(pl, key){
        console.log('Playlist ' + chalk.green(pl.name) + ' has ' + chalk.green(pl.tracks.length) + ' tracks imported');
    });
});

    // pm.getStreamUrl("Thvfmp2be3c7kbp6ny4arxckz54", console.log);
});
