from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

def get_documents_from_file(filename: str) -> list[Document]:
    
    with open(filename, encoding="UTF-8") as file:
        text = file.read()

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=350,
            chunk_overlap=20
        )

        documents = splitter.create_documents([text])

        return documents
    
import os
import asyncio

# Получаем путь относительно корня проекта
current_dir = os.path.dirname(__file__)
project_root = os.path.abspath(os.path.join(current_dir, '..', '..'))
prompt_file = os.path.join(project_root, "src", "prompts", "first.md")

doc = get_documents_from_file(prompt_file)
