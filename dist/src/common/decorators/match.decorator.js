import { registerDecorator, } from 'class-validator';
export function Match(property, validationOptions) {
    return (object, propertyName) => {
        registerDecorator({
            name: 'match',
            target: object.constructor,
            propertyName,
            constraints: [property],
            options: validationOptions,
            validator: {
                validate(value, args) {
                    const relatedPropertyName = args.constraints[0];
                    const relatedValue = args.object[relatedPropertyName];
                    return value === relatedValue;
                },
                defaultMessage(args) {
                    const relatedPropertyName = args.constraints[0];
                    return `${args.property} deve ser igual a ${relatedPropertyName}`;
                },
            },
        });
    };
}
//# sourceMappingURL=match.decorator.js.map