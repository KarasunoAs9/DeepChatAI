from langchain_community.vectorstores import FAISS
from langchain.tools import Tool
from langchain.tools.retriever import create_retriever_tool


def vector_search_tool(vectore_store: FAISS) -> Tool:
    retriever = vectore_store.as_retriever(search_kwargs={"k":3})
    retriever_tool = create_retriever_tool(
        retriever,
        name="VectorSearch",
        description="Используй этот инструмент, когда нужно найти данные из документов."
    )
    
    return retriever_tool