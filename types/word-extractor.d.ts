declare module "word-extractor" {
  type ExtractedDocument = {
    getBody: () => string;
  };

  export default class WordExtractor {
    extract(filePath: string): Promise<ExtractedDocument>;
  }
}
