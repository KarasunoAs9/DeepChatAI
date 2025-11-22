from src.utils.document import doc
from src.utils.vector_store import create_vectore_store
from src.utils.agent import create_agent

vector_store = create_vectore_store(doc)
agent = create_agent(vector_store)

async def process_chat(message: str, chat_history: list) -> str:
    result = await agent.ainvoke(
       {
           "messages": [("human", message)]
       }
    )
    
    # В новой версии langchain ответ может быть в разных форматах
    if isinstance(result, dict):
        if "messages" in result:
            # Извлекаем последнее сообщение от ассистента
            messages = result["messages"]
            for msg in reversed(messages):
                if hasattr(msg, "content"):
                    return msg.content
                elif isinstance(msg, dict) and "content" in msg:
                    return msg["content"]
        elif "output" in result:
            return result["output"]
    
    return str(result)
