import { FC, Suspense, lazy } from 'react';
import CustomImageRenderer from './renderers/CustomImageRenderer';
import CustomCodeRenderer from './renderers/CustomCodeRenderer';
const Output = lazy(() => import('editorjs-react-renderer'));

interface EditorOutputProps {
	/* eslint-disable-next-line */
  content: any;
}

const renderers = {
  image: CustomImageRenderer,
  code: CustomCodeRenderer,
};

const style = {
  paragraph: {
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
};

const EditorOutput: FC<EditorOutputProps> = ({ content }) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Output
        style={style}
        className='text-sm'
        renderers={renderers}
        data={content}
      />
    </Suspense>
  );
};

export default EditorOutput;
