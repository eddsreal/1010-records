import {
  TransactionFormTypeEnum,
  TransactionTypeEnum,
} from "@/common/enums/transactions.enum";
import { inputStyles } from "@/common/styles/input.styles";
import { CurrencyInputAtom } from "@/components/atoms/currency-input.atom";
import { Category } from "@/database/schema";
import { useAccountsStore } from "@/stores/accounts.store";
import { usePrioritiesStore } from "@/stores/priorities.store";
import { useTransactionsStore } from "@/stores/transactions.store";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Picker, TextField } from "react-native-ui-lib";

interface FormValues {
  amount: number;
  currency: string;
  type: TransactionTypeEnum;
  account: number;
  priority: number;
  category: number;
}

export default function NewTransactionView() {
  const { mode, newTransaction } = useTransactionsStore();
  const { accounts } = useAccountsStore();
  const { priorities } = usePrioritiesStore();

  const {
    control,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormValues>({
    mode: "all",
    defaultValues: {
      type: TransactionTypeEnum.EXPENSE,
      account: undefined,
      priority: undefined,
      category: undefined,
    },
  });

  const isCompleteMode = mode === TransactionFormTypeEnum.COMPLETE;
  const type = watch("type");
  const isIncome = type === TransactionTypeEnum.INCOME;

  const renderHeader = () => {
    const currentMonth = new Date().toLocaleString("es-ES", {
      month: "2-digit",
    });
    const currentYear = new Date().getFullYear();

    return (
      <View className="flex-row justify-between items-center">
        <Text className="text-app-primary text-lg">
          {currentYear}-{currentMonth}
        </Text>
        <View className="flex-row items-center">
          <Pressable
            className={`py-2 px-4 rounded-l-md ${
              !isCompleteMode ? "bg-primary" : "bg-gray-200"
            }`}
            onPress={() =>
              useTransactionsStore.setState({
                mode: TransactionFormTypeEnum.FAST,
              })
            }
          >
            <Text
              className={`${!isCompleteMode ? "text-white font-bold" : "text-gray-400"} text-lg`}
            >
              Rápido
            </Text>
          </Pressable>
          <Pressable
            className={`py-2 px-4 rounded-r-md ${
              isCompleteMode ? "bg-primary" : "bg-gray-200"
            }`}
            onPress={() =>
              useTransactionsStore.setState({
                mode: TransactionFormTypeEnum.COMPLETE,
              })
            }
          >
            <Text
              className={`${isCompleteMode ? "text-white font-bold" : "text-gray-400"} text-lg`}
            >
              Completo
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const renderMovementAmount = () => {
    return (
      <View>
        <Text className="text-primary text-lg font-bold">Monto</Text>
        <View className="flex-row gap-4 items-center p-4">
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <CurrencyInputAtom
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={"Monto"}
                placeholderClassName="text-gray-500"
                containerStyle={{
                  ...inputStyles.containerStyle,
                  width: "80%",
                }}
              />
            )}
            name="amount"
          />
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                placeholder="Moneda"
                onBlur={onBlur}
                onChangeText={onChange}
                inputMode="decimal"
                value={value}
                fieldStyle={inputStyles.fieldStyle}
                containerStyle={{
                  ...inputStyles.containerStyle,
                  width: "20%",
                }}
              />
            )}
            name="currency"
          />
        </View>
      </View>
    );
  };

  const renderMovementType = () => {
    return (
      <View>
        <Text className="text-primary text-lg font-bold">
          Tipo de transacción
        </Text>
        <View className="flex-row gap-4 items-center justify-center p-4">
          <Pressable
            className={`py-2 px-4 rounded-md ${
              isIncome ? "bg-primary" : "bg-gray-200"
            }`}
            onPress={() => setValue("type", TransactionTypeEnum.INCOME)}
          >
            <Text
              className={`${isIncome ? "text-white" : "text-gray-400"} text-lg font-bold`}
            >
              Ingreso
            </Text>
          </Pressable>
          <Pressable
            className={`py-2 px-4 rounded-md ${
              !isIncome ? "bg-secondary" : "bg-gray-200"
            }`}
            onPress={() => setValue("type", TransactionTypeEnum.EXPENSE)}
          >
            <Text
              className={`${!isIncome ? "text-white" : "text-gray-400"} text-lg font-bold`}
            >
              Gasto
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const renderAccounts = () => {
    return (
      <View className="flex-col">
        <Text className="text-primary text-lg font-bold">Cuentas</Text>
        <View className="items-center">
          <Controller
            control={control}
            name="account"
            render={({ field: { onChange, onBlur, value } }) => (
              <Picker
                value={value}
                placeholder={"Selecciona una cuenta"}
                onChange={(itemValue) => onChange(itemValue)}
                showSearch
                searchPlaceholder={"Buscar cuenta"}
                renderInput={(value: number | undefined) => {
                  const account = accounts.find(
                    (account) => account.id === value,
                  );
                  return (
                    <View className="flex-row items-center gap-2 border border-gray-200 rounded-xl px-8 py-2">
                      {!value ? (
                        <Text className="text-app-gray text-lg font-bold">
                          Cuenta
                        </Text>
                      ) : (
                        <Text className="text-app-gray text-lg font-bold">
                          {value
                            ? `${account?.name} - ${account?.balance}`
                            : "Selecciona una cuenta"}
                        </Text>
                      )}
                    </View>
                  );
                }}
                searchStyle={{
                  color: "black",
                  placeholderTextColor: "gray",
                }}
              >
                {accounts.map((account) => (
                  <Picker.Item
                    key={account.id}
                    label={account.name}
                    value={account.id}
                  />
                ))}
              </Picker>
            )}
          />
        </View>
      </View>
    );
  };

  const renderPriority = () => {
    const selectedPriority = newTransaction.selectedPriority;
    return (
      <View>
        <Text className="text-primary text-lg font-bold">Prioridad</Text>

        <View className="flex-row gap-4 items-center justify-center p-4">
          <View
            className={`flex-col gap-4 items-start justify-start ${
              newTransaction.selectedPriority ? "w-1/2" : "w-full"
            }`}
          >
            {priorities.map((priority) => {
              const isSelected =
                newTransaction.selectedPriority?.id === priority.id;
              return (
                <Pressable
                  key={priority.id}
                  className={`py-2 px-4 rounded-md ${
                    isSelected ? "bg-primary" : "bg-gray-200"
                  } w-full`}
                  onPress={() =>
                    useTransactionsStore.setState({
                      newTransaction: {
                        ...newTransaction,
                        selectedPriority: priority,
                      },
                    })
                  }
                >
                  <Text
                    className={`${isSelected ? "text-white" : "text-gray-400"} font-bold`}
                  >
                    {priority.id} - {priority.icon} - {priority.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {selectedPriority && (
            <View className="flex-col gap-4 items-center justify-start w-1/2 h-full">
              <View>
                <Text className="text-primary text-lg font-bold">
                  Prioridad seleccionada
                </Text>
                <Text className="text-app-gray text-lg font-bold">
                  {selectedPriority?.icon} - {selectedPriority?.name}
                </Text>
              </View>
              {!selectedPriority.categories.length ? (
                <View className="flex-col items-start gap-2 border border-gray-200 rounded-xl p-2">
                  <Text className="text-app-gray text-lg font-bold">
                    No hay categorías
                  </Text>
                  <Pressable
                    className="py-2 px-4 rounded-md bg-primary"
                    onPress={() => router.push("/categories-wizzard")}
                  >
                    <Text className="text-white text-lg font-bold">
                      Agregar categoría
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <Controller
                  control={control}
                  name="category"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Picker
                      value={value}
                      placeholder={"Selecciona una categoría"}
                      onChange={(itemValue) => onChange(itemValue)}
                      showSearch
                      searchPlaceholder={"Buscar categoría"}
                      renderInput={(value: number | undefined) => {
                        const category = selectedPriority.categories.find(
                          (category: Category) => category.id === value,
                        );
                        return (
                          <View className="flex-row items-center gap-2 border border-gray-200 rounded-xl px-8 py-2">
                            {!value ? (
                              <Text className="text-app-gray text-lg font-bold">
                                Categoría
                              </Text>
                            ) : (
                              <Text className="text-app-gray text-lg font-bold">
                                {value
                                  ? `${category?.icon} - ${category?.name}`
                                  : "Selecciona una categoría"}
                              </Text>
                            )}
                          </View>
                        );
                      }}
                      searchStyle={{
                        color: "black",
                        placeholderTextColor: "gray",
                      }}
                    >
                      {selectedPriority.categories.map((category: Category) => (
                        <Picker.Item
                          key={category.id}
                          label={`${category.icon} - ${category.name}`}
                          value={category.id}
                        />
                      ))}
                    </Picker>
                  )}
                />
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderForecastComparison = () => {
    const amount = watch("amount");
    const proyected = 100000;
    const isMoreThanProyected = amount > proyected;
    const isZero = amount - proyected === 0;

    return (
      <View>
        <Text className="text-primary text-lg font-bold">
          Comparación de gastos
        </Text>
        <View className="flex-row gap-4 items-center justify-center p-4">
          <View>
            <Text className="text-app-gray text-lg font-bold">Proyectado</Text>
            <Text className="text-app-gray text-lg font-bold">{proyected}</Text>
          </View>
          <View>
            <Text className="text-app-gray text-lg font-bold">
              Ejecutado + Esta Transacción
            </Text>
            <Text className="text-app-gray text-lg font-bold">{amount}</Text>
          </View>
        </View>
        <View className="flex-row gap-4 items-center justify-center p-4">
          <Text className="text-app-gray text-lg font-bold">
            {isMoreThanProyected && !isZero
              ? `Estás ${(proyected - amount) * -1} por encima de lo proyectado`
              : ""}
            {!isMoreThanProyected && !isZero
              ? `Aún tienes ${proyected - amount} presupuestado para este mes`
              : ""}
            {isZero ? "Muy bien! estás sin fugas de dinero" : ""}
          </Text>
        </View>
      </View>
    );
  };

  const renderActions = () => {
    return (
      <View className="flex-row gap-4 items-center justify-center p-4">
        <Pressable className="py-2 px-4 rounded-md bg-primary">
          <Text className="text-white text-lg font-bold">Guardar</Text>
        </Pressable>
        <Pressable
          className="py-2 px-4 rounded-md bg-secondary"
          onPress={() => {
            reset();
            router.back();
            newTransaction.reset?.();
          }}
        >
          <Text className="text-white text-lg font-bold">Cancelar</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <ScrollView className="p-4 bg-white">
      <Text className="text-primary text-5xl font-bold">
        Registro de transacción
      </Text>

      {renderHeader()}

      <View>
        {renderMovementType()}
        {renderMovementAmount()}
        {isCompleteMode && renderAccounts()}
        {isCompleteMode && !isIncome && renderPriority()}
        {isCompleteMode && !isIncome && renderForecastComparison()}
        {renderActions()}
      </View>
    </ScrollView>
  );
}
