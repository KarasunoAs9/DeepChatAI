from langchain_community.vectorstores import FAISS
from langchain_core.tools import Tool


def vector_search_tool(vectore_store: FAISS) -> Tool:
    retriever = vectore_store.as_retriever(search_kwargs={"k":3})
    
    def search_documents(query: str) -> str:
        """Используй этот инструмент, когда нужно найти данные из документов."""
        docs = retriever.invoke(query)
        return "\n\n".join([doc.page_content for doc in docs])
    
    retriever_tool = Tool(
        name="VectorSearch",
        description="Используй этот инструмент, когда нужно найти данные из документов.",
        func=search_documents
    )
    
    return retriever_tool