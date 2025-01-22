import styles from './App.module.css';
import logo from '/Snow-Brain-AI.png';
import Chat from './components/Chat/Chat';
import { useState } from 'react';
import Controls from './components/Controls/Controls';
import { Assistant } from './assistants/googleai';
import Loader from './components/Loader/Loader';
// Initialiser GoogleGenerativeAI


// Définir les types pour les messages
type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

const App: React.FC = () => {
  const assistant = new Assistant();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isloading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  // Ajouter un message au state
  const addMessage = (message: Message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };
  const updateMessageContent = (content:string) => {
    setMessages((PrevMessage)=> PrevMessage.map((message, index) => index === PrevMessage.length - 1 ? {...message, content: `${message.content}${content}`}: message));
  };
  // Envoyer un contenu et gérer la réponse AI
  const handleContentSend = async (content: string) => {
    addMessage({ content, role: 'user' });
    setIsLoading(true);
    try {
      // console.log('Sending message to AI:', content);
      const result = await assistant.chatStream(content);
      // console.log('AI response:', result);
      // addMessage({ content: result, role: 'assistant' });
       
      let isFirstChunk = false;
      for await (const chunck of result){
        console.log('Received chunk:', chunck);
        if(!isFirstChunk){
          addMessage({content:"", role: 'assistant'});
          isFirstChunk = true;
          setIsLoading(false);
          setIsStreaming(true);
        }
        updateMessageContent(chunck);
      }
      setIsStreaming(false);
    } catch (error) {
      console.error(error);
      addMessage({
        content: "Sorry, I couldn't process your request. Please try again.",
        role: 'system',
      });

    }  finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  return (
    <div className={styles.App}>
      {isloading && <Loader/>}
      <header className={styles.Header}>
        <img src={logo} alt="logo" className={styles.Logo} />
        <h2 className={styles.Title}>AI Chatbot</h2>
      </header>

      <div className={styles.ChatContainer}>
        <Chat messages={messages} />
      </div>
      <Controls isDisable={isloading || isStreaming} onSend={handleContentSend}/>
    </div>
  );
};

export default App;