"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoDB = exports.Client = void 0;
const fs_1 = __importDefault(require("fs"));
const mongodb_1 = __importStar(require("mongodb"));
exports.mongoDB = mongodb_1.default;
/**
 * connects to mongodb client and re-uses same connection application wide
 * to benefit from connection pool
 */
class Client {
    constructor(_dbName = "", _url = "") {
        this._dbName = _dbName;
        this._url = _url;
        //copy all props of mongodb 
        Object.assign(this, mongodb_1.default);
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
        return this._url;
    }
    /**
     * create database connection
     * @private {function}
     * @return {}
     */
    _connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._client) {
                if (!this._url)
                    throw new Error("mongo server url is not set. Set url first");
                try {
                    this._client = yield mongodb_1.MongoClient.connect(this._url);
                    return this._client; //as of mongodb 6.2.0 MongoClient.connect return client object
                }
                catch (err) {
                    if (this.writeErrLogsToFIle) {
                        let line = "-".repeat(20);
                        let errorHead = `${Date.now().toLocaleString()}`;
                        let error = `\n${line}\n${line}\n${errorHead}\n${line}\n${err.message}\n${line}\n${line}\n\n`;
                        fs_1.default.appendFile("./mongoError.log", error, (fileWriteError) => {
                            if (fileWriteError)
                                console.log(fileWriteError); // :| what else to do ? lol :p
                        });
                    }
                    throw err;
                }
            }
            return this._client;
        });
    }
    /**
     * get mongodb connection client
     *
     */
    getClient() {
        return __awaiter(this, void 0, void 0, function* () {
            //return client if already connected
            if (this._client)
                return this._client;
            //or create new client and return
            return yield this._connect();
        });
    }
    /**
     * get mongodb database instance
     * @param {string} dbName
     * @returns
     */
    getDB(dbName = this._dbName) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!dbName && !this._dbName) {
                throw new Error("either pass dbName as first argument or set default dbName");
            }
            let db = (_a = (yield this.getClient())) === null || _a === void 0 ? void 0 : _a.db(dbName);
            // if(!db) throw new Error("DB uninitialized");
            return db;
        });
    }
    /**
     * close client connection
     *
     * ***not needed  unless you know what you are doing***
     *
     * this module was written to re-use the client connection
     * no need  to close it except while the application is being terminated
     */
    closeClient() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._client) {
                yield this._client.close();
                this._client = null;
            }
            else {
                console.info("Client is already closed");
            }
            return;
        });
    }
}
exports.Client = Client;
exports.default = new Client();
