import React, {useEffect, useState} from 'react';
import {ActivityIndicator} from 'react-native';
import PropTypes from 'prop-types';
import api from '../../services/api';

import {
  Container,
  Header,
  Name,
  Avatar,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
} from './styles';

export default function User({navigation}) {
  const [starred, setStarred] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(2);
  const [refreshing, setRefreshing] = useState(false);
  const user = navigation.getParam('user');

  useEffect(() => {
    async function getUserStarred() {
      setLoading(true);
      const response = await api.get(`/users/${user.login}/starred`);
      setStarred(response.data);
      setLoading(false);
    }

    getUserStarred();
  }, []);

  async function loadMore() {
    const response = await api.get(`/users/${user.login}/starred?page=${page}`);
    const newPage = page + 1;
    setPage(newPage);
    setStarred([...starred, ...response.data]);
  }

  async function refreshList() {
    setRefreshing(true);
    const response = await api.get(`/users/${user.login}/starred`);
    setStarred(response.data);
    setRefreshing(false);
  }

  function handleNavigate(repository) {
    navigation.navigate('Repository', {repository});
  }

  return (
    <Container>
      <Header>
        <Avatar source={{uri: user.avatar}} />
        <Name>{user.name}</Name>
        <Bio>{user.bio}</Bio>
      </Header>
      {loading ? (
        <ActivityIndicator color="#161925" />
      ) : (
        <Stars
          onRefresh={refreshList}
          refreshing={refreshing}
          onEndReachedThreshold={0.2}
          onEndReached={loadMore}
          data={starred}
          keyExtractor={star => String(star.id)}
          renderItem={({item}) => (
            <Starred onPress={() => handleNavigate(item)}>
              <OwnerAvatar source={{uri: item.owner.avatar_url}} />
              <Info>
                <Title>{item.name}</Title>
                <Author>{item.owner.login}</Author>
              </Info>
            </Starred>
          )}
        />
      )}
    </Container>
  );
}

User.navigationOptions = ({navigation}) => ({
  title: navigation.getParam('user').name,
});

User.propTypes = {
  navigation: PropTypes.shape({
    getParam: PropTypes.func,
    navigate: PropTypes.func,
  }).isRequired,
};
