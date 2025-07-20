import { fileProcessor } from "@utils/index";


const { writeFileAsync } = fileProcessor;
writeFileAsync(__dirname + "/test.txt", "test")