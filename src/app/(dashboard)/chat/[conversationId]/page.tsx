import { ChatContainer } from '@/components/chat/ChatContainer'

interface ChatConversationPageProps {
  params: Promise<{
    conversationId: string
  }>
}

export default async function ChatConversationPage({ params }: ChatConversationPageProps) {
  const { conversationId } = await params
  return <ChatContainer conversationId={conversationId} />
}
