import readline from 'node:readline';
const args = process.argv.slice(2);
const emit = (value) => process.stdout.write(JSON.stringify(value) + '\n');
if (args.includes('--version')) {
  console.log('fake-cli 1.0');
  process.exit();
}
if (args.includes('app-server')) {
  const reader = readline.createInterface({ input: process.stdin });
  reader.on('line', (line) => {
    const m = JSON.parse(line);
    if (m.method === 'initialize') emit({ id: m.id, result: {} });
    if (m.method === 'config/read') emit({ id: m.id, result: { config: { model: 'model-sol' } } });
    if (m.method === 'model/list')
      emit({
        id: m.id,
        result: {
          data: [
            {
              model: m.params.cursor ? 'model-luna' : 'model-sol',
              displayName: m.params.cursor ? 'Luna' : 'Sol',
              isDefault: !m.params.cursor,
              supportedReasoningEfforts: [{ reasoningEffort: 'low' }, { reasoningEffort: 'high' }],
            },
          ],
          nextCursor: m.params.cursor ? null : 'page-2',
        },
      });
  });
} else if (args[0] === 'models') {
  if (args.includes('list'))
    console.log(
      JSON.stringify({
        families: [
          {
            name: 'OpenAI',
            models: [
              { id: 'model-sol', label: 'Sol', default: true },
              { id: 'model-luna', label: 'Luna' },
            ],
          },
        ],
      }),
    );
  else console.log('model-low\tModel Low\nmodel-high\tModel High');
} else if (args.includes('exec')) {
  let input = '';
  process.stdin.on('data', (chunk) => (input += chunk));
  process.stdin.on('end', () => {
    emit({ type: 'thread.started', thread_id: 'fake-session' });
    if (input.includes('HOLD')) {
      setInterval(() => {}, 1000);
      return;
    }
    emit({
      type: 'item.completed',
      item: { id: '1', type: 'agent_message', text: 'Verified fake CLI result' },
    });
    emit({ type: 'turn.completed', usage: { input_tokens: 7, output_tokens: 4 } });
  });
} else if (args.includes('--input-format')) {
  process.stdin.resume();
  process.stdin.on('end', () => {
    emit({
      event: 'result',
      result: { status: 'SUCCESS', response: 'Antigravity result', conversation_id: 'fake-agy' },
    });
  });
} else {
  console.log('Devin result');
}
