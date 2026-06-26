export function buildDefineRoutesTemplate(): string {
  return `import { Request, Response, Router } from 'express';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type Controller = {
  handle(req: Request, res: Response): Promise<void> | void;
};

type ControllerConstructor = new () => Controller;

type RouteDefinition = {
  method: HttpMethod;
  path: string;
  controller: ControllerConstructor;
};

export function defineRoutes(routes: RouteDefinition[]): Router {
  const router = Router();

  for (const route of routes) {
    const controller = new route.controller();
    const handler = (req: Request, res: Response) => controller.handle(req, res);

    switch (route.method) {
      case 'GET':
        router.get(route.path, handler);
        break;
      case 'POST':
        router.post(route.path, handler);
        break;
      case 'PUT':
        router.put(route.path, handler);
        break;
      case 'PATCH':
        router.patch(route.path, handler);
        break;
      case 'DELETE':
        router.delete(route.path, handler);
        break;
    }
  }

  return router;
}
`;
}
