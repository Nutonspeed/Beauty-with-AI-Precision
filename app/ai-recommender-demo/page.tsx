import { redirect } from 'next/navigation';

export default function AIRecommenderDemoRedirectPage() {
  redirect('/demo/ai?section=recommender');
}
