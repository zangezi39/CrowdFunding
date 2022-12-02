import React from 'react';
import { Container } from 'semantic-ui-react';
import Head from 'next/head';
import Header from './Header';

export default (props) =>{
  return (
    <Container>
      <Head>
        <link async
          rel="stylesheet"
          href="//cdn.jsdelivr.net/npm/semantic-ui/dist/semantic.min.css"
        />
      </Head>

      <Header />
        {props.children}
      <h1></h1>
    </Container>
  );

};
