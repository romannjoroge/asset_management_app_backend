var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import openai from "./client.js";
export function getEmbedding(text) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let result = yield openai.embeddings.create({ input: text, model: "text-embedding-3-small" });
            return result.data[0].embedding;
        }
        catch (err) {
            console.log("Could Not Get Embedding of text", err);
            throw "Could Not Get Embedding of text";
        }
    });
}
//# sourceMappingURL=embeddings.js.map