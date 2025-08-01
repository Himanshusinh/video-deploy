import Head from 'next/head';
import VideoForm from './components/VideoForm';

export default function Home() {
  return (
    <div>
      <Head>
        <title>MiniMax Hailuo Text-to-Video Generator</title>
      </Head>
      <main style={{margin:'auto', maxWidth: 600, padding:40}}>
        <h1>MiniMax Hailuo Text-to-Video</h1>
        <VideoForm />
        <p style={{marginTop:'2em', color:'#999'}}>
          After submission, you will get a Task ID for result tracking or via callback.<br/>
          No image upload required - this is purely prompt-driven (text to video).
        </p>
      </main>
    </div>
  );
}
