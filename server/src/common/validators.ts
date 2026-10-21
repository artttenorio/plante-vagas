import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

function soDigitos(valor: string) {
  return valor.replace(/\D/g, '');
}

function cpfValido(cpf: string): boolean {
  const digitos = soDigitos(cpf);
  if (digitos.length !== 11 || /^(\d)\1{10}$/.test(digitos)) return false;

  const calcularDigito = (base: string) => {
    let soma = 0;
    let peso = base.length + 1;
    for (const char of base) {
      soma += Number(char) * peso;
      peso--;
    }
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const d1 = calcularDigito(digitos.slice(0, 9));
  const d2 = calcularDigito(digitos.slice(0, 9) + d1);
  return digitos === digitos.slice(0, 9) + String(d1) + String(d2);
}

function cnpjValido(cnpj: string): boolean {
  const digitos = soDigitos(cnpj);
  if (digitos.length !== 14 || /^(\d)\1{13}$/.test(digitos)) return false;

  const calcularDigito = (base: string) => {
    const pesos = base.length === 12
      ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
      : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const soma = base
      .split('')
      .reduce((acc, char, i) => acc + Number(char) * pesos[i], 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const d1 = calcularDigito(digitos.slice(0, 12));
  const d2 = calcularDigito(digitos.slice(0, 12) + d1);
  return digitos === digitos.slice(0, 12) + String(d1) + String(d2);
}

export function IsValidCPF(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidCPF',
      target: object.constructor,
      propertyName,
      options: { message: 'CPF inválido', ...validationOptions },
      validator: {
        validate(value: unknown) {
          return typeof value === 'string' && cpfValido(value);
        },
      },
    });
  };
}

export function IsValidCNPJ(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidCNPJ',
      target: object.constructor,
      propertyName,
      options: { message: 'CNPJ inválido', ...validationOptions },
      validator: {
        validate(value: unknown) {
          return typeof value === 'string' && cnpjValido(value);
        },
      },
    });
  };
}

/** Rejeita string vazia ou só com espaços (diferente de @IsNotEmpty, que só rejeita ""). */
export function IsNotBlank(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNotBlank',
      target: object.constructor,
      propertyName,
      options: { message: `${propertyName} não pode ficar em branco`, ...validationOptions },
      validator: {
        validate(value: unknown) {
          return typeof value === 'string' && value.trim().length > 0;
        },
      },
    });
  };
}

/** Data que não pode estar no futuro (ex: data de abertura de empresa, data de início de experiência). */
export function IsNotFutureDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNotFutureDate',
      target: object.constructor,
      propertyName,
      options: { message: `${propertyName} não pode estar no futuro`, ...validationOptions },
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string') return false;
          const data = new Date(value);
          if (isNaN(data.getTime())) return false;
          return data <= new Date();
        },
      },
    });
  };
}

/** Nome completo: só letras (com acento), espaços, apóstrofo e hífen, com pelo menos duas palavras. */
export function IsFullName(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isFullName',
      target: object.constructor,
      propertyName,
      options: { message: `${propertyName} deve ser um nome completo válido`, ...validationOptions },
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string') return false;
          return /^[A-Za-zÀ-ÖØ-öø-ÿ'-]+(?:\s[A-Za-zÀ-ÖØ-öø-ÿ'-]+)+$/.test(value.trim());
        },
      },
    });
  };
}

/** Data de nascimento sensata: não no futuro, não de criança, não impossível. */
export function IsSaneBirthDate(minAge = 14, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isSaneBirthDate',
      target: object.constructor,
      propertyName,
      options: {
        message: `${propertyName} deve ser uma data de nascimento válida (idade mínima de ${minAge} anos)`,
        ...validationOptions,
      },
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string') return false;
          const data = new Date(value);
          if (isNaN(data.getTime())) return false;

          const hoje = new Date();
          if (data > hoje) return false;

          const limiteAntigo = new Date();
          limiteAntigo.setFullYear(hoje.getFullYear() - 120);
          if (data < limiteAntigo) return false;

          const limiteRecente = new Date();
          limiteRecente.setFullYear(hoje.getFullYear() - minAge);
          return data <= limiteRecente;
        },
      },
    });
  };
}

/** Telefone brasileiro com DDD: 10 (fixo) ou 11 (celular) dígitos. */
export function IsBrazilianPhone(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isBrazilianPhone',
      target: object.constructor,
      propertyName,
      options: { message: `${propertyName} deve ter DDD + número (10 ou 11 dígitos)`, ...validationOptions },
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string') return false;
          const digitos = soDigitos(value);
          return digitos.length === 10 || digitos.length === 11;
        },
      },
    });
  };
}

/** CEP brasileiro: exatamente 8 dígitos. */
export function IsCep(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isCep',
      target: object.constructor,
      propertyName,
      options: { message: `${propertyName} deve ter 8 dígitos`, ...validationOptions },
      validator: {
        validate(value: unknown) {
          return typeof value === 'string' && soDigitos(value).length === 8;
        },
      },
    });
  };
}

/** Nome de cidade: só letras, espaços e hífen (rejeita só números). */
export function IsCityName(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isCityName',
      target: object.constructor,
      propertyName,
      options: { message: `${propertyName} deve ser um nome de cidade válido`, ...validationOptions },
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string') return false;
          return /^[A-Za-zÀ-ÖØ-öø-ÿ'\s-]{2,}$/.test(value.trim());
        },
      },
    });
  };
}

/** URL só http/https — barra "javascript:", "ftp://" etc. */
export function IsHttpUrl(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isHttpUrl',
      target: object.constructor,
      propertyName,
      options: { message: `${propertyName} deve ser um link http(s) válido`, ...validationOptions },
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string') return false;
          try {
            const url = new URL(value);
            return url.protocol === 'http:' || url.protocol === 'https:';
          } catch {
            return false;
          }
        },
      },
    });
  };
}

/**
 * Data de início de processo seletivo não pode estar além de um horizonte
 * razoável (ex: ano 2999) — a validação de "não pode ser no passado" já
 * existe em outro lugar (assertDataInicioNaoPassada em vaga.service.ts),
 * esse decorator cobre só o limite superior.
 */
export function IsNotAbsurdlyFarInFuture(maxYearsAhead: number, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNotAbsurdlyFarInFuture',
      target: object.constructor,
      propertyName,
      options: {
        message: `${propertyName} não pode estar a mais de ${maxYearsAhead} anos no futuro`,
        ...validationOptions,
      },
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string') return false;
          const data = new Date(value);
          if (isNaN(data.getTime())) return false;
          const limite = new Date();
          limite.setFullYear(limite.getFullYear() + maxYearsAhead);
          return data <= limite;
        },
      },
    });
  };
}

/**
 * Nenhum item de uma lista de objetos não pode repetir o valor de `campo`
 * (comparação sem diferenciar maiúsculas/minúsculas ou espaços nas pontas)
 * — usado pra benefícios e etapas do processo seletivo (campo "nome") e
 * idiomas do currículo (campo "idioma").
 */
export function HasNoDuplicateField(campo: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'hasNoDuplicateField',
      target: object.constructor,
      propertyName,
      options: {
        message: `${propertyName} não pode ter "${campo}" repetido`,
        ...validationOptions,
      },
      validator: {
        validate(value: unknown, _args: ValidationArguments) {
          if (!Array.isArray(value)) return true;
          const valores = value
            .map((item: Record<string, unknown>) =>
              typeof item?.[campo] === 'string' ? (item[campo] as string).trim().toLowerCase() : null,
            )
            .filter((v): v is string => v !== null);
          return new Set(valores).size === valores.length;
        },
      },
    });
  };
}

/** Atalho de HasNoDuplicateField pro campo "nome". */
export function HasNoDuplicateNomes(validationOptions?: ValidationOptions) {
  return HasNoDuplicateField('nome', validationOptions);
}

/**
 * A data de `propertyName` não pode vir antes da data em `otherProperty` do
 * mesmo objeto — usado pra "data de fim não pode ser antes da data de
 * início" em experiência profissional e formação acadêmica.
 */
export function IsOnOrAfterDate(otherProperty: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isOnOrAfterDate',
      target: object.constructor,
      propertyName,
      options: {
        message: `${propertyName} não pode ser anterior a ${otherProperty}`,
        ...validationOptions,
      },
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          const outroValor = (args.object as Record<string, unknown>)[otherProperty];
          if (typeof outroValor !== 'string') return true;
          const data = new Date(value);
          const outraData = new Date(outroValor);
          if (isNaN(data.getTime()) || isNaN(outraData.getTime())) return true;
          return data >= outraData;
        },
      },
    });
  };
}
