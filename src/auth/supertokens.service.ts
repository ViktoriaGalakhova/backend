import { Inject, Injectable } from '@nestjs/common';
import supertokens from 'supertokens-node';
import EmailPassword from 'supertokens-node/recipe/emailpassword';
import Session from 'supertokens-node/recipe/session';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthOptions } from './auth.config';
import { AUTH_OPTIONS } from './auth.config';
import { AppRole } from './auth.types';

@Injectable()
export class SupertokensService {
  constructor(
    @Inject(AUTH_OPTIONS) private readonly options: AuthOptions,
    private readonly prisma: PrismaService,
  ) {
    supertokens.init({
      framework: 'express',
      supertokens: {
        connectionURI: options.connectionUri,
        apiKey: options.apiKey,
      },
      appInfo: {
        appName: options.appName,
        apiDomain: options.apiDomain,
        websiteDomain: options.websiteDomain,
        apiBasePath: options.apiBasePath,
        websiteBasePath: options.websiteBasePath,
      },
      recipeList: [
        EmailPassword.init({
          signUpFeature: {
            formFields: [
              {
                id: 'displayName',
                validate: (value: string) =>
                  Promise.resolve(
                    value.trim().length < 2
                      ? 'Имя должно быть не короче 2 символов'
                      : undefined,
                  ),
              },
            ],
          },
          override: {
            apis: (original) => ({
              ...original,
              signUpPOST: async (input) => {
                const field = input.formFields.find(
                  (formField) => formField.id === 'displayName',
                );

                input.userContext.displayName = field?.value;

                return original.signUpPOST!(input);
              },
            }),
            functions: (original) => ({
              ...original,
              signUp: async (input) => {
                const result = await original.signUp(input);

                if (result.status === 'OK') {
                  await this.createLocalUser(
                    result.user.id,
                    input.email,
                    input.userContext.displayName as string,
                  );
                }

                return result;
              },
            }),
          },
        }),
        Session.init({
          getTokenTransferMethod: () => 'cookie',
          override: {
            functions: (original) => ({
              ...original,
              createNewSession: async (input) => {
                const user =
                  (await this.prisma.user.findUnique({
                    where: { supertokensId: input.userId },
                  })) ?? (await this.restoreLocalUser(input.userId));

                input.accessTokenPayload = {
                  userId: user?.id,
                  displayName: user?.displayName,
                  role: user?.role,
                };

                return original.createNewSession(input);
              },
            }),
          },
        }),
      ],
    });
  }

  private async createLocalUser(
    supertokensId: string,
    email: string,
    displayName: string,
  ) {
    const normalizedEmail = email.trim().toLowerCase();

    return this.prisma.user.create({
      data: {
        supertokensId,
        email: normalizedEmail,
        displayName: displayName.trim() || normalizedEmail,
        role: this.options.adminEmails.includes(normalizedEmail)
          ? AppRole.Admin
          : AppRole.User,
      },
    });
  }

  private async restoreLocalUser(supertokensId: string) {
    const account = await supertokens.getUser(supertokensId);
    const email = account?.emails[0];

    if (!email) {
      return null;
    }

    return this.createLocalUser(supertokensId, email, email);
  }
}
