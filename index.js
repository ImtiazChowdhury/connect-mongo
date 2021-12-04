"use strict";

const fs = require("fs");
const mongoDB = require("mongodb");


/**
 * connects to mongodb client and re-uses same connection application wide to benefit from connection pool
 */
class Client {
    constructor() {

        //copy all props of mongodb 
        Object.assign(this, mongoDB);

        /** @private */
        this._client = null;

        /** @private */
        this._connect = this._connect.bind(this);

        /** @private */
        this._url;

        /** @private */
        this._dbName;

        this.writeErrLogsToFIle = true;
        this.getDB = this.getDB.bind(this);
    }

    /**
     * set database name
     */
    set dbName(name) {
        this._dbName = name;
    }

    /**
     * get database name
     * @return {string} database name
     */
    get dbName() {
        return this._dbName;
    }

    /**
     * set mongo connection url
     */
    set url(urlStr) {
        this._url = urlStr;

        //reset client to null; so that the next connect attempt creates new connection to new url
        this._client = null;
    }

    /**
     * get mongo connection url
     * @return {string} mongo connection url
     */
    get url() {
        return this._url
    }

    /**
     * create database connection
     * @private {function}
     * @return {}
     */
    async _connect() {

        if (!this._client) {
            if (!this._url) throw new Error("mongo server url is not set. Set url first");
            try {

                this._client = await mongoDB.MongoClient.connect(this._url, { useNewUrlParser: true, useUnifiedTopology: true });
                return this._client; //as of mongodb 4.0.13 MongoClient.connect return client object

            } catch (err) {

                if (this.writeErrLogsToFIle) {
                    let line = "-".repeat(20);
                    let errorHead = `${Date.now().toLocaleString()}`
                    let error = `\n${line}\n${line}\n${errorHead}\n${line}\n${err.message}\n${line}\n${line}\n\n`
                    
                    fs.appendFile("./mongoError.log", error, (fileWriteError) => {
                        if (fileWriteError) console.log(fileWriteError) // :| what else to do ? lol :p
                    });
                }
                else throw err;
            }
        }

        return this._client;
    }

    /**
     * get mongodb connection client
     * 
     */
    async getClient() {

        //return client if already connected
        if (this._client) return this._client;

        //or create new client and return
        return await this._connect();
    }

    /**
     * get mongodb database instance
     * @param {string} dbName 
     * @returns 
     */
    async getDB(dbName = this._dbName) {

        if (!dbName && !this._dbName) {
            throw new Error("either pass dbName as first argument or set default dbName")
        }

        let db = (await this.getClient()).db(dbName);
        return db;
    }

    /**
     * close client connection
     * 
     * ***not needed  unless you know what you are doing***
     * 
     * this module was written to re-use the client connection
     * no need  to close it except while the application is being terminated
     */
    async closeClient() {
        if (this._client) {
            await this._client.close();
            this._client = null;
        } else {
            console.info("Client is already closed");
        }
        return 
    }
}

module.exports = new Client();
module.exports.Client = Client;