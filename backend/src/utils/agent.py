from src.utils.vector_search import vector_search_tool
from langchain_community.vectorstores import FAISS
from langchain_openai import ChatOpenAI
from langchain.agents import create_openai_functions_agent, AgentExecutor

def create_agent(vector_store: FAISS) -> AgentExecutor:
    llm = ChatOpenAI(
        model="gpt-5-nano",
        temperature=0.9
    )

    tool = [vector_search_tool(vector_store)]

    agent = create_openai_functions_agent(
        llm=llm,
        tools=tool
    )

    agent_executor = AgentExecutor(
        agent=agent,
        tools=tool
    )

    return agent_executor