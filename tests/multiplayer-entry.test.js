import test from 'node:test';
import assert from 'node:assert/strict';
import { multiplayerEntryRedirect } from '../multiplayer/entry-route.js';

test('Pages lobby aliases lead to the fixed live host with the invitation intact', () => {
  for (const path of ['multiplayer', 'multiplayer.html', 'multiplayer/']) {
    const query = '?room=ABC234&lang=en&note=a%2Bb&room=XYZ789';
    assert.equal(
      multiplayerEntryRedirect('https://gracianb.github.io/project-ohana/' + path + query + '#invite'),
      'https://project-ohana-multiplayer.netlify.app/multiplayer' + query + '#invite',
    );
  }
  assert.equal(
    multiplayerEntryRedirect('https://gracianb.github.io/project-ohana/multiplayer.html'),
    'https://project-ohana-multiplayer.netlify.app/multiplayer',
  );
});

test('Netlify production, previews, local servers and unrelated sites are never redirected', () => {
  for (const href of [
    'https://project-ohana-multiplayer.netlify.app/multiplayer?room=ABC234',
    'https://deploy-preview-12--project-ohana-multiplayer.netlify.app/multiplayer',
    'http://localhost:8888/multiplayer.html?room=ABC234',
    'http://127.0.0.1:8888/multiplayer.html',
    'https://gracianb.github.io/project-ohana/',
    'https://gracianb.github.io/project-ohana/index.html',
    'https://gracianb.github.io/another-project/multiplayer.html',
    'https://gracianb.github.io/project-ohana/multiplayer.html/other',
    'https://gracianb.github.io.evil.example/project-ohana/multiplayer.html',
    'https://gracianb.github.io:8443/project-ohana/multiplayer.html',
    'http://gracianb.github.io/project-ohana/multiplayer.html',
    'https://example.com/project-ohana/multiplayer.html',
    'not a URL',
  ]) assert.equal(multiplayerEntryRedirect(href), null, href);
});

test('invitation query values cannot choose another destination', () => {
  const redirect = multiplayerEntryRedirect(
    'https://gracianb.github.io/project-ohana/multiplayer.html?room=ABC234&next=https%3A%2F%2Fevil.example&host=evil.example#https://evil.example',
  );
  const target = new URL(redirect);
  assert.equal(target.origin, 'https://project-ohana-multiplayer.netlify.app');
  assert.equal(target.pathname, '/multiplayer');
  assert.equal(target.searchParams.get('room'), 'ABC234');
  assert.equal(target.searchParams.get('next'), 'https://evil.example');
  assert.equal(target.hash, '#https://evil.example');
});
