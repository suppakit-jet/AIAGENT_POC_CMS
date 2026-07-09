module.exports = {
  forbidden: [
    {
      name: 'no-framework-in-domain',
      severity: 'error',
      from: { path: '^src/modules/[^/]+/domain' },
      to: {
        path: [
          '^node_modules/(@nestjs|express|fastify|@prisma|prisma)',
          '^src/modules/[^/]+/(adapters|application)',
        ],
      },
    },
    {
      name: 'no-adapter-in-application',
      severity: 'error',
      from: { path: '^src/modules/[^/]+/application' },
      to: { path: '^src/modules/[^/]+/adapters' },
    },
    {
      name: 'no-cross-module-internals',
      severity: 'error',
      from: { 
        path: '^src/modules/([^/]+)',
        pathNot: '\\.(spec|test)\\.ts$'
      },
      to: {
        path: '^src/modules/(?!\\1)[^/]+/(domain|application/use-cases|adapters)',
      },
    },
    {
      name: 'no-circular',
      severity: 'error',
      from: { pathNot: 'node_modules' },
      to: { circular: true },
    },
  ],
  options: {
    tsConfig: { fileName: 'tsconfig.json' },
    enhancedResolveOptions: { exportsFields: ['exports'] },
  },
};
