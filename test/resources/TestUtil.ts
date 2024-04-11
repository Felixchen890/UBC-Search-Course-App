import * as fs from "fs-extra";

const persistDir = "./data";

const getDataFromArchive = (name: string): string =>
	fs.readFileSync(`test/resources/archives/${name}`).toString("base64");

const clearDisk =  (): void => {
	fs.removeSync(persistDir);
};

export {getDataFromArchive, clearDisk, persistDir};
