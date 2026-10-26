import { config } from './config';
import { WorkspaceRepository } from './storage/workspace.repository';
import { RunService } from './runs/run.service';
import { createServer } from './http/server';
const repository = new WorkspaceRepository(config.dataDir),
  runs = new RunService(repository, config.projectsDir),
  server = createServer(repository, runs);
server.listen(config.port, config.host, () =>
  console.log(`Luma Hive: http://${config.host}:${config.port}\nSQLite: ${repository.file}`),
);
server.on('error', (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
for (const signal of ['SIGINT', 'SIGTERM'] as const)
  process.on(signal, () => {
    server.emit('shutdown');
    runs.shutdown();
    server.close(() => {
      repository.close();
      process.exit();
    });
    setTimeout(() => process.exit(), 4000).unref();
  });
