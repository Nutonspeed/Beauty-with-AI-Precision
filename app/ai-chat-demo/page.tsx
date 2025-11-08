import { redirect } from 'next/navigation';

export default function AIChatDemoRedirectPage() {
  redirect('/demo/ai?section=chat');
}
