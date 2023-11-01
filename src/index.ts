import fs from "fs";
import mongoDB, { MongoClient } from "mongodb";

/**
 * connects to mongodb client and re-uses same connection application wide 
 * to benefit from connection pool
 */
class Client {
    private _client: MongoClient | null;

    public writeErrLogsToFIle: boolean;

    constructor(private _dbName: string = "", private _url: string = "") {

        //copy all props of mongodb 
        Object.assign(this, mongoDB);

        this._client = null;

        this._connect = this._connect.bind(this);

        this._url = '';


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
    get dbName(): string {
        return this._dbName;
    }

    /**
     * set mongo connection url
     */
    set url(urlStr: string) {
        this._url = urlStr;

        //reset client to null; so that the next connect attempt creates new connection to new url
        this._client = null;
    }

    /**
     * get mongo connection url
     * @return {string} mongo connection url
     */
    get url(): string {
        return this._url
    }

    /**
     * create database connection
     * @private {function}
     * @return {}
     */
    private async _connect(): Promise<mongoDB.MongoClient> {

        if (!this._client) {
            if (!this._url) throw new Error("mongo server url is not set. Set url first");
            try {

                this._client = await MongoClient.connect(this._url);
                return this._client; //as of mongodb 6.2.0 MongoClient.connect return client object

            } catch (err: any) {

                if (this.writeErrLogsToFIle) {
                    let line = "-".repeat(20);
                    let errorHead = `${Date.now().toLocaleString()}`
                    let error = `\n${line}\n${line}\n${errorHead}\n${line}\n${err.message}\n${line}\n${line}\n\n`

                    fs.appendFile("./mongoError.log", error, (fileWriteError: NodeJS.ErrnoException | null) => {
                        if (fileWriteError) console.log(fileWriteError) // :| what else to do ? lol :p
                    });
                }
                throw err;
            }
        }

        return this._client;
    }

    /**
     * get mongodb connection client
     * 
     */
    async getClient(): Promise<mongoDB.MongoClient> {

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
    async getDB(dbName = this._dbName): Promise<mongoDB.Db> {

        if (!dbName && !this._dbName) {
            throw new Error("either pass dbName as first argument or set default dbName")
        }

        let db = (await this.getClient())?.db(dbName);
        // if(!db) throw new Error("DB uninitialized");

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

export default new Client();
export { Client, mongoDB };