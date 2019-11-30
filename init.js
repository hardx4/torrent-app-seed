var express = require('express');
var webtorrent = require('webtorrent');
var path = require('path');
var http = require('http');
const parseTorrent = require('parse-torrent');
var fs = require("fs");
require("config-reader");
require('logger');

var client = new webtorrent({torrentPort: config.torrentPort});
var torrents_files = [];
var torrents_folder = config.torrents_folder;

var time = function() {
	return Math.floor(new Date() / 1000);
};

var buildMagnetURI = function(infoHash) {
    return 'magnet:?xt=urn:btih:' + infoHash + '&tr=udp%3a%2f%2ftracker.opentrackr.org%3a1337%2fannounce&tr=udp%3A%2F%2Ftracker.publicbt.com%3A80&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Ftracker.ccc.de%3A80&tr=udp%3A%2F%2Ftracker.istole.it%3A80&tr=udp%3A%2F%2Fopen.demonii.com%3A1337&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fexodus.desync.com%3A6969';
};

function refresh_torrents(){
    fs.readdir(config.torrents_file_folder, function(err, files){
        torrents_files = files; 
        addtorrents(0);
    });
}

function addtorrents(i){
    if(typeof torrents_files[i] == "undefined"){
        return ;
    }
    
    try {
        var readtorrent_f = parseTorrent(fs.readFileSync(config.torrents_file_folder + '/' + torrents_files[i]));
    } catch (error) {
        i++;
        addtorrents(i);
        return ;
    }
    
    var magnet_uri = buildMagnetURI(readtorrent_f.infoHash);    
    if(client.get(magnet_uri) == null){
        i++;        
        client.add(magnet_uri, {path: "./"+torrents_folder}, (torrent) => {
            addtorrents(i);
        });        
        return ;
    }else{
        i++;
        addtorrents(i);
        return ;
    }
}

refresh_torrents();
setInterval(()=>{refresh_torrents();}, config.refresh_interval_seconds*1000);