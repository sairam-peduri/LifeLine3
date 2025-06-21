# Importing libraries
import numpy as np
import pandas as pd
import pickle
from scipy.stats import mode
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.svm import SVC
from sklearn.naive_bayes import GaussianNB
from sklearn.ensemble import RandomForestClassifier
from sklearn.utils import resample
from sklearn.metrics import accuracy_score, confusion_matrix

# Reading the dataset and removing empty columns
DATA_PATH = "dataset/Training.csv"
data = pd.read_csv(DATA_PATH).dropna(axis=1)

# Checking dataset balance
disease_counts = data["prognosis"].value_counts()
print("Original Disease Distribution:\n", disease_counts)

# Plot original distribution
plt.figure(figsize=(18, 8))
sns.countplot(y=data["prognosis"], order=disease_counts.index)
plt.title("Original Disease Distribution in Training Data")
plt.show()

# Encoding the target variable
encoder = LabelEncoder()
data["prognosis"] = encoder.fit_transform(data["prognosis"])

# Splitting dataset into features and target
X = data.iloc[:, :-1]
y = data.iloc[:, -1]

disease_symptom_map = {}
for index, row in data.iterrows():
    disease = encoder.inverse_transform([row["prognosis"]])[0]  # Decode disease
    symptoms = list(X.columns[row[:-1] == 1])  # Get symptoms where value is 1
    if disease not in disease_symptom_map:
        disease_symptom_map[disease] = set(symptoms)
    else:
        disease_symptom_map[disease].update(symptoms)

# Convert symptom sets to lists and save as pickle
for disease in disease_symptom_map:
    disease_symptom_map[disease] = list(disease_symptom_map[disease])

with open("disease_symptom_map.pkl", "wb") as f:
    pickle.dump(disease_symptom_map, f)

print("✅ disease_symptom_map.pkl saved successfully!")

# Balancing the dataset using oversampling and undersampling
df_balanced = pd.DataFrame()

for disease in np.unique(y):
    subset = data[data["prognosis"] == disease]
    count = subset.shape[0]

    if count < 30:  # Oversampling minority classes
        subset = resample(subset, replace=True, n_samples=30, random_state=42)
    elif count > 100:  # Undersampling majority classes
        subset = resample(subset, replace=False, n_samples=100, random_state=42)




    df_balanced = pd.concat([df_balanced, subset])

# Shuffling the balanced dataset
df_balanced = df_balanced.sample(frac=1, random_state=42).reset_index(drop=True)
df_balanced.sample(frac=0.2).to_csv("dataset/Testing.csv", index=False)

# Splitting balanced dataset into train and test sets
X_balanced = df_balanced.iloc[:, :-1]
y_balanced = df_balanced.iloc[:, -1]
X_train, X_test, y_train, y_test = train_test_split(X_balanced, y_balanced, test_size=0.2, random_state=24)

print(f"Balanced Train: {X_train.shape}, {y_train.shape}")
print(f"Balanced Test: {X_test.shape}, {y_test.shape}")

ALL_SYMPTOMS = list(X_balanced.columns)


# Checking new dataset balance
balanced_counts = y_balanced.value_counts()
print("Balanced Disease Distribution:\n", balanced_counts)

# Plot balanced distribution
plt.figure(figsize=(18, 8))
sns.countplot(y=y_balanced, order=balanced_counts.index)
plt.title("Balanced Disease Distribution in Training Data")
plt.show()

# Defining scoring metric for cross-validation
def cv_scoring(estimator, X, y):
    return accuracy_score(y, estimator.predict(X))

# Initializing Models
models = {
    "SVC": SVC(),
    "Gaussian NB": GaussianNB(),
    "Random Forest": RandomForestClassifier(random_state=18)
}

# Setting cross-validation splits dynamically
num_samples = len(y_balanced)
cv_splits = min(5, num_samples)

# Cross-validation scores
for model_name, model in models.items():
    scores = cross_val_score(model, X_balanced, y_balanced, cv=cv_splits, n_jobs=-1, scoring=cv_scoring)
    print("=" * 60)
    print(f"{model_name} Scores: {scores}")
    print(f"Mean Score: {np.mean(scores):.2f}")

# Training and evaluating models
trained_models = {}

for model_name, model in models.items():
    model.fit(X_train, y_train)
    preds = model.predict(X_test)

    print(f"\nAccuracy on train data by {model_name}: {accuracy_score(y_train, model.predict(X_train)) * 100:.2f}%")
    print(f"Accuracy on test data by {model_name}: {accuracy_score(y_test, preds) * 100:.2f}%")

    # Confusion matrix
    plt.figure(figsize=(12, 8))
    sns.heatmap(confusion_matrix(y_test, preds), annot=True, fmt="d")
    plt.title(f"Confusion Matrix - {model_name}")
    plt.show()

    trained_models[model_name] = model

# Training models on full balanced dataset
final_svm_model = SVC(random_state=18)
final_nb_model = GaussianNB()
final_rf_model = RandomForestClassifier(random_state=18)

final_svm_model.fit(X_balanced, y_balanced)
final_nb_model.fit(X_balanced, y_balanced)
final_rf_model.fit(X_balanced, y_balanced)

# Loading test dataset
test_data = pd.read_csv("dataset/Testing.csv").dropna(axis=1)
test_X = test_data.iloc[:, :-1]
test_Y = test_data.iloc[:, -1]

# ✅ Handling unknown labels gracefully
known_labels = set(encoder.classes_)
test_Y = test_Y.apply(lambda x: x if x in known_labels else "Unknown")

# Remove "Unknown" labels before evaluation
test_X = test_X[test_Y != "Unknown"]
test_Y = test_Y[test_Y != "Unknown"]

# ✅ If all labels are unknown, exit early
if test_Y.empty:
    print("❌ No valid test samples found! Exiting evaluation.")
else:
    # Transform labels only if test_Y is not empty
    test_Y = encoder.transform(test_Y)

    # Making predictions using majority voting
    final_preds = [mode([i, j, k]).mode[0] for i, j, k in zip(
        final_svm_model.predict(test_X),
        final_nb_model.predict(test_X),
        final_rf_model.predict(test_X)
    )]

    print(f"✅ Accuracy on test dataset by combined model: {accuracy_score(test_Y, final_preds) * 100:.2f}%")

    # Confusion matrix for combined model
    plt.figure(figsize=(12, 8))
    sns.heatmap(confusion_matrix(test_Y, final_preds), annot=True, fmt="d")
    plt.title("Confusion Matrix - Combined Model")
    plt.show()

# Saving trained models
pickle.dump(final_svm_model, open("svm_model.pkl", "wb"))
pickle.dump(final_nb_model, open("nb_model.pkl", "wb"))
pickle.dump(final_rf_model, open("rf_model.pkl", "wb"))
pickle.dump(encoder, open("encoder.pkl", "wb"))

print("✅ All models and encoder saved successfully!")

# Save symptoms list
pickle.dump(ALL_SYMPTOMS, open("symptoms.pkl", "wb"))

print("✅ symptoms.pkl saved successfully!")