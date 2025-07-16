import { Application } from 'express';
declare class App {
    app: Application;
    port: number;
    constructor();
    private initializeMiddlewares;
    private initializeRoutes;
    private initializeErrorHandling;
    listen(): void;
}
export default App;
//# sourceMappingURL=app.d.ts.map