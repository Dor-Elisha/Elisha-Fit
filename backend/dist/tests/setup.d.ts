declare global {
    var testUtils: {
        createTestUser: (userData?: any) => Promise<any>;
        generateAuthToken: (userId: string) => string;
    };
}
export {};
//# sourceMappingURL=setup.d.ts.map