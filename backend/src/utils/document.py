from langchain_core.documents import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter

async def get_documents_from_file(filename: str) -> list[Document]:
    
    with open(filename, encoding="UTF-8") as file:
        text = file.read()

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=350,
            chunk_overlap=20
        )

        documents = splitter.create_documents([text])

        return documents
    
doc = get_documents_from_file("src/prompts/first.md")
