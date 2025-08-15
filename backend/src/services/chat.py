from src.utils.document import doc
from src.utils.vector_store import create_vectore_store
from src.utils.agent import create_agent

vector_store = create_vectore_store(doc)
agent = create_agent(vector_store)

async def process_chat(message: str, chat_history: list) -> str:

    retriever = await agent.ainvoke(
       {
           "input": message,
           "chat_history": chat_history
       }
    )

    return retriever["output"]
