import mongoDB from "mongodb";
/**
 * connects to mongodb client and re-uses same connection application wide
 * to benefit from connection pool
 */
declare class Client {
    private _dbName;
    private _url;
    private _client;
    writeErrLogsToFIle: boolean;
    constructor(_dbName?: string, _url?: string);
    /**
     * set database name
     */
    set dbName(name: string);
    /**
     * get database name
     * @return {string} database name
     */
    get dbName(): string;
    /**
     * set mongo connection url
     */
    set url(urlStr: string);
    /**
     * get mongo connection url
     * @return {string} mongo connection url
     */
    get url(): string;
    /**
     * create database connection
     * @private {function}
     * @return {}
     */
    private _connect;
    /**
     * get mongodb connection client
     *
     */
    getClient(): Promise<mongoDB.MongoClient>;
    /**
     * get mongodb database instance
     * @param {string} dbName
     * @returns
     */
    getDB(dbName?: string): Promise<mongoDB.Db>;
    /**
     * close client connection
     *
     * ***not needed  unless you know what you are doing***
     *
     * this module was written to re-use the client connection
     * no need  to close it except while the application is being terminated
     */
    closeClient(): Promise<void>;
}
declare const _default: Client;
export default _default;
export { Client };
