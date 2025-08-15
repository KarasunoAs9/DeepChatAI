from src.utils.vector_search import vector_search_tool
from langchain_community.vectorstores import FAISS
from langchain_openai import ChatOpenAI
from langchain.agents import create_openai_functions_agent, AgentExecutor
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

def create_agent(vector_store: FAISS) -> AgentExecutor:
    llm = ChatOpenAI(
        model="gpt-4o-mini",  # Исправил модель на существующую
        temperature=0.7
    )

    tools = [vector_search_tool(vector_store)]

    # Создаем промпт для агента
    prompt = ChatPromptTemplate.from_messages([
        ("system", """Вы - DeepChatAI, интеллектуальный помощник. 
        
Ваши возможности:
- Отвечать на вопросы пользователей
- Искать информацию в документах с помощью векторного поиска
- Вести естественный диалог на русском языке
- Предоставлять точную и полезную информацию

Инструкции:
- Отвечайте дружелюбно и профессионально
- Используйте инструмент поиска, когда нужна информация из документов
- Если не знаете ответ, честно скажите об этом
- Отвечайте на русском языке, если не указано иначе
- Будьте лаконичны, но информативны"""),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ])

    agent = create_openai_functions_agent(
        llm=llm,
        tools=tools,
        prompt=prompt
    )

    agent_executor = AgentExecutor(
        agent=agent,
        tools=tools,
        verbose=True,
        handle_parsing_errors=True
    )

    return agent_executor