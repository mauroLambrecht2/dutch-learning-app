import { useState } from 'react';
import { Button } from '../ui/button';
import { MessageCircle, Check } from 'lucide-react';

interface ConversationNode {
  id: string;
  speaker: 'teacher' | 'student';
  text: string;
  audioUrl?: string;
  responses?: Array<{
    text: string;
    nextId: string;
    isCorrect?: boolean;
  }>;
}

interface ConversationBuilderProps {
  scenario: string;
  nodes: ConversationNode[];
  onComplete: () => void;
}

export function ConversationBuilder({ scenario, nodes, onComplete }: ConversationBuilderProps) {
  const [currentNodeId, setCurrentNodeId] = useState(nodes[0]?.id);
  const [conversation, setConversation] = useState<Array<{ speaker: string; text: string }>>([]);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const currentNode = nodes.find(n => n.id === currentNodeId);

  const handleResponse = (response: any) => {
    if (!currentNode) return;

    setConversation([
      ...conversation,
      { speaker: 'Teacher', text: currentNode.text },
      { speaker: 'You', text: response.text }
    ]);

    if (response.isCorrect) {
      setScore(score + 1);
    }

    const nextNode = nodes.find(n => n.id === response.nextId);
    if (nextNode) {
      setCurrentNodeId(nextNode.id);
    } else {
      setIsComplete(true);
      setTimeout(onComplete, 2000);
    }
  };

  if (isComplete) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-2xl text-zinc-900 mb-2" style={{ fontWeight: 700 }}>
          Conversation Complete!
        </h3>
        <p className="text-zinc-600">
          You got {score} correct responses out of {conversation.length / 2}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-4 bg-indigo-50 border border-indigo-200">
        <h3 className="text-sm text-indigo-900 mb-1" style={{ fontWeight: 600 }}>
          Scenario
        </h3>
        <p className="text-sm text-indigo-700">{scenario}</p>
      </div>

      {/* Conversation History */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {conversation.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.speaker === 'You' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] p-3 ${
                msg.speaker === 'You'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-100 text-zinc-900'
              }`}
            >
              <div className="text-xs opacity-75 mb-1">{msg.speaker}</div>
              <div className="text-sm">{msg.text}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Current Prompt */}
      {currentNode && (
        <div>
          <div className="p-4 bg-zinc-100 border-l-4 border-indigo-600 mb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-xs text-zinc-500 mb-1">Teacher says:</div>
                <div className="text-sm text-zinc-900">{currentNode.text}</div>
              </div>
              {currentNode.audioUrl && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => new Audio(currentNode.audioUrl).play()}
                  className="ml-3"
                >
                  🔊
                </Button>
              )}
            </div>
          </div>

          {/* Response Options */}
          <div className="space-y-2">
            <div className="text-sm text-zinc-600 mb-3" style={{ fontWeight: 500 }}>
              How do you respond?
            </div>
            {currentNode.responses?.map((response, index) => (
              <button
                key={index}
                onClick={() => handleResponse(response)}
                className="w-full p-4 text-left border-2 border-zinc-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all"
              >
                <div className="text-sm text-zinc-900">{response.text}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
