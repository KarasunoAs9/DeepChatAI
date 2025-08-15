from langchain.docstore.document import Document
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.tools import Tool
from envparse import env

env.read_envfile()

def create_vectore_store(docs: list[Document]) -> FAISS:
    embedding = OpenAIEmbeddings(api_key=env.str("OPENAI_API_KEY"))
    vectore_store = FAISS.from_documents(docs, embedding)
    
    return vectore_store